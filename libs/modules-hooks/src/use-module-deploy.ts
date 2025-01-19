import { CONFIG } from '@hatsprotocol/config';
import { CONTROLLER_TYPES, DEPLOYMENT_TYPES } from '@hatsprotocol/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deployClaimsHatter,
  deployModule,
  deployModuleWithClaimsHatter,
  prepareDeployModuleAndRegisterWithClaimsHatterArgs,
  processClaimsHatter,
  processModule,
  processValues,
} from 'hats-utils';
import { useToast } from 'hooks';
import _, { get, pick } from 'lodash';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { AppHat, DeploymentType, FormData, HandlePendingTx, ModuleDetails, SupportedChains } from 'types';
import { Hex } from 'viem';
import { useAccount, useBalance, useWalletClient } from 'wagmi';

import { useHatsModules } from './use-hats-modules';
import { useMultiClaimsHatterCheck } from './use-multi-claims-hatter-check';
import { useMultiClaimsHatterContractWrite } from './use-multi-claims-hatter-contract-write';

interface UseModuleDeployArgs {
  localForm: UseFormReturn;
  selectedHat?: AppHat;
  chainId: SupportedChains | undefined;
  storedData: Partial<FormData>[] | undefined;
  setStoredData?: Dispatch<SetStateAction<Partial<FormData>[]>>;
  onchainHats: AppHat[] | undefined;
  editMode?: boolean;
  selectedModuleDetails?: ModuleDetails;
  onCloseModuleDrawer: () => void;
  deploymentType: DeploymentType;
  handlePendingTx: HandlePendingTx | undefined;
}

const useModuleDeploy = ({
  localForm,
  selectedHat,
  chainId,
  storedData,
  setStoredData,
  onchainHats,
  editMode,
  selectedModuleDetails,
  onCloseModuleDrawer,
  deploymentType,
  handlePendingTx,
}: UseModuleDeployArgs) => {
  const { watch } = localForm;
  const originalValues = watch();
  const tokenAddress = originalValues['Token Address'];
  const { data: balance } = useBalance({
    address: tokenAddress,
    token: tokenAddress,
  });
  const { hatterIsAdmin } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    onchainHats,
  });

  const values = useMemo(() => {
    if (!balance) return originalValues;
    const { decimals: tokenDecimals } = pick(balance, ['decimals']);

    return processValues({
      originalValues,
      selectedModuleDetails,
      tokenDecimals,
    });
  }, [originalValues, selectedModuleDetails, balance]);

  const toast = useToast();
  const queryClient = useQueryClient();
  const { modules } = useHatsModules({ chainId });
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const hatId = selectedHat ? BigInt(selectedHat?.id) : BigInt(0);
  const adminHat = values?.adminHat as Hex | undefined;
  const incrementWearers = values?.incrementWearers as string | undefined;
  const isPermissionlesslyClaimable = values?.isPermissionlesslyClaimable;
  const claimabilityType = values?.initialClaimabilityType as number | undefined;
  const claimsHatterModule = _.find(modules, {
    name: CONFIG.modules.claimsHatter,
  });

  // const ipId = selectedHat?.id && hatIdDecimalToIp(BigInt(selectedHat?.id));
  // const hatName = selectedHat?.detailsObject?.data?.name;
  // const hatTitle = `${ipId} (${hatName})`;

  const { instanceAddress } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    onchainHats,
    storedData,
    editMode,
  });

  // console.log(
  //   selectedModuleDetails,
  //   localForm.formState.isValid,
  //   values,
  //   hatId,
  //   claimabilityType,
  // );
  const deployModuleAndRegisterWithClaimsHatterArgs = prepareDeployModuleAndRegisterWithClaimsHatterArgs({
    selectedModuleDetails,
    isLocalFormValid: localForm.formState.isValid,
    values,
    hatId,
    claimabilityType,
  });

  const adminHatData = useMemo(() => {
    const storedHat = _.find(storedData, ['id', adminHat]);
    const onchainHat = _.find(onchainHats, ['id', adminHat]);

    // translate boolean to form data string
    const mutable: { mutable?: string } = {};
    if (storedHat?.mutable) {
      mutable.mutable = storedHat?.mutable;
    }

    return {
      ...onchainHat,
      ...storedHat,
      ...mutable,
    };
  }, [storedData, onchainHats, adminHat]);

  const onAllSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['claimsHatter'] });
    onCloseModuleDrawer();
  }, [queryClient, onCloseModuleDrawer]);

  const onlyModuleDeploySuccess = useCallback(
    (newInstance?: Hex | null) => {
      if (!newInstance || !selectedModuleDetails) return;

      let type = CONTROLLER_TYPES.eligibility;
      if (selectedModuleDetails.type.toggle) {
        type = CONTROLLER_TYPES.toggle;
      }
      const moduleHats = processModule({
        moduleAddress: newInstance,
        storedData,
        selectedHat,
        type,
      });

      const hatIds = _.uniq(_.map(moduleHats, 'id'));
      const updatedHats: any[] = _.map(
        hatIds,
        (id: Hex) => _.merge({}, _.find(moduleHats, { id })) as Partial<FormData>,
      );
      setStoredData?.(updatedHats);
      toast.success({
        title: 'Saved',
        description: `${selectedModuleDetails?.name} has been successfully deployed!`,
        duration: 1500,
      });

      onAllSuccess();
    },
    [storedData, selectedHat, setStoredData, toast, selectedModuleDetails, onAllSuccess],
  );

  const moduleAndClaimsHatterDeploySuccess = useCallback(
    (newInstances?: Hex[] | null) => {
      if (!_.isArray(newInstances)) return;

      const [moduleAddress, claimsHatterAddress] = newInstances;

      const updatedHatsWithModule = processModule({
        moduleAddress,
        storedData,
        selectedHat,
        type: CONTROLLER_TYPES.eligibility,
      });
      const updatedHatsWithClaimsHatter = processClaimsHatter({
        claimsHatterAddress,
        storedData,
        adminHat: adminHatData,
        incrementWearers,
      });
      const hatIds = _.uniq(_.concat(_.map(updatedHatsWithModule, 'id'), _.map(updatedHatsWithClaimsHatter, 'id')));
      const updatedHats: any[] = _.map(hatIds, (id: Hex) => {
        const hatterHat = _.find(updatedHatsWithClaimsHatter, {
          id,
        });
        const moduleHat = _.find(updatedHatsWithModule, ['id', id]);
        return _.merge({}, hatterHat, moduleHat) as Partial<FormData>;
      });
      setStoredData?.(updatedHats);

      toast.success({
        title: 'Saved',
        description: instanceAddress
          ? `${selectedModuleDetails?.name} Module has been successfully deployed!`
          : `${selectedModuleDetails?.name} Module and Claims Hatter have been successfully deployed!`,
        duration: 2500,
      });

      onAllSuccess();
    },
    [
      storedData,
      adminHatData,
      incrementWearers,
      setStoredData,
      toast,
      instanceAddress,
      selectedModuleDetails,
      selectedHat,
      onAllSuccess,
    ],
  );

  const { writeAsync: deployModuleAndRegisterWithClaimsHatter, isLoading: isLoadingMultiClaimsHatter } =
    useMultiClaimsHatterContractWrite({
      functionName: 'setHatClaimabilityAndCreateModule',
      address: instanceAddress,
      enabled: !!instanceAddress && !_.some(deployModuleAndRegisterWithClaimsHatterArgs, _.isUndefined),
      args: deployModuleAndRegisterWithClaimsHatterArgs,
      chainId,
      handlePendingTx,
      afterSuccess: onlyModuleDeploySuccess,
      hatId: selectedHat?.id,
    });

  const onlyClaimsHatterDeploySuccess = useCallback(
    (newInstance?: Hex | null) => {
      if (!newInstance) return;

      const updatedHats = processClaimsHatter({
        claimsHatterAddress: newInstance,
        storedData,
        adminHat: adminHatData,
        incrementWearers,
      });

      setStoredData?.(updatedHats);

      toast.success({
        title: 'Saved',
        description: 'Claims Hatter Module has been successfully deployed!',
        duration: 1500,
      });

      onAllSuccess();
    },
    [storedData, adminHatData, incrementWearers, setStoredData, toast, onAllSuccess],
  );

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      switch (deploymentType) {
        case DEPLOYMENT_TYPES.ONLY_MODULE: {
          if (instanceAddress && isPermissionlesslyClaimable === 'Yes' && _.isEmpty(selectedHat?.claimableBy)) {
            return deployModuleAndRegisterWithClaimsHatter();
          }

          return deployModule({
            selectedModuleDetails,
            selectedHat,
            address: address as Hex,
            values,
            chainId,
            hatId,
            walletClient,
          }).then((resultData) => {
            const newInstance = get(resultData, 'newInstance');
            if (!newInstance) return;
            onlyModuleDeploySuccess(newInstance);
          });
        }

        case DEPLOYMENT_TYPES.MODULE_AND_CLAIMS_HATTER:
          if (!adminHat) return null;

          return deployModuleWithClaimsHatter({
            selectedModuleDetails,
            claimsHatterId: claimsHatterModule?.id as Hex,
            selectedHat,
            address: address as Hex,
            values,
            chainId,
            hatId,
            adminHatId: BigInt(adminHat),
            walletClient,
          }).then((resultData) => {
            const newInstances = get(resultData, 'newInstances');
            if (!newInstances) return;
            moduleAndClaimsHatterDeploySuccess(newInstances);
          });

        case DEPLOYMENT_TYPES.ONLY_CLAIMS_HATTER:
          if (!adminHat) return null;

          return deployClaimsHatter({
            claimsHatterModule,
            selectedHat,
            address: address as Hex,
            values,
            chainId,
            adminHatId: BigInt(adminHat),
            walletClient,
          }).then((resultData) => {
            const newInstance = get(resultData, 'newInstance');
            if (!newInstance) return;
            onlyClaimsHatterDeploySuccess(newInstance);
          });

        default:
          return null;
      }
    },
  });
  // console.log({
  //   adminHat,
  //   isPermissionlesslyClaimable: isPermissionlesslyClaimable === 'Yes',
  //   hatterIsAdmin,
  // });

  return {
    deploy: mutateAsync,
    isLoading: isLoadingMultiClaimsHatter,
    isBlocked: isPermissionlesslyClaimable === 'Yes' && !adminHat && !hatterIsAdmin,
  };
};

export { useModuleDeploy };

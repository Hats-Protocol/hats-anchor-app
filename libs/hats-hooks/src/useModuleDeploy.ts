import {
  CONFIG,
  DEPLOYMENT_TYPES,
  MODULE_TYPES,
} from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  decimalId,
  deployClaimsHatter,
  deployModule,
  deployModuleWithClaimsHatter,
  prepareDeployModuleAndRegisterWithClaimsHatterArgs,
  processClaimsHatter,
  processModule,
  processValues,
} from 'hats-utils';
import { useToast } from 'hooks';
import _ from 'lodash';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  AppHat,
  DeploymentType,
  FormData,
  HandlePendingTx,
  ModuleDetails,
  SupportedChains,
} from 'types';
import { Hex } from 'viem';
import { useAccount, useToken } from 'wagmi';

import useHatsModules from './useHatsModules';
import useMultiClaimsHatterCheck from './useMultiClaimsHatterCheck';
import useMultiClaimsHatterContractWrite from './useMultiClaimsHatterContractWrite';

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
}: {
  localForm: UseFormReturn;
  selectedHat?: AppHat;
  chainId: SupportedChains;
  storedData: Partial<FormData>[];
  setStoredData?: Dispatch<SetStateAction<Partial<FormData>[]>>;
  onchainHats: AppHat[];
  editMode?: boolean;
  selectedModuleDetails?: ModuleDetails;
  onCloseModuleDrawer: () => void;
  deploymentType: DeploymentType;
  handlePendingTx?: HandlePendingTx;
}) => {
  const { watch } = localForm;
  const originalValues = watch();
  const tokenAddress = originalValues['Token Address'];
  const { data } = useToken({ address: tokenAddress });
  const tokenDecimals = data?.decimals;

  const values = useMemo(
    () =>
      processValues({
        originalValues,
        selectedModuleDetails,
        tokenDecimals,
      }),
    [originalValues, selectedModuleDetails, tokenDecimals],
  );

  const toast = useToast();
  const queryClient = useQueryClient();
  const { modules } = useHatsModules({ chainId });
  const { address } = useAccount();
  const hatId = BigInt(decimalId(selectedHat?.id));
  const adminHat = values?.adminHat as Hex | undefined;
  const incrementWearers = values?.incrementWearers as string | undefined;
  const isPermissionlesslyClaimable = values?.isPermissionlesslyClaimable;
  const claimabilityType = values?.initialClaimabilityType as
    | number
    | undefined;
  const claimsHatterModule = _.find(modules, {
    name: CONFIG.claimsHatterModuleName,
  });
  const hatTitle =
    selectedHat?.id &&
    `${hatIdDecimalToIp(BigInt(selectedHat?.id))} (${
      selectedHat?.detailsObject?.data?.name
    })`;

  const { instanceAddress, hatterIsAdmin } = useMultiClaimsHatterCheck({
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
  const deployModuleAndRegisterWithClaimsHatterArgs =
    prepareDeployModuleAndRegisterWithClaimsHatterArgs({
      selectedModuleDetails,
      isLocalFormValid: localForm.formState.isValid,
      values,
      hatId,
      claimabilityType,
    });

  const {
    deploy: deployModuleAndRegisterWithClaimsHatter,
    isLoading: isLoadingMultiClaimsHatter,
  } = useMultiClaimsHatterContractWrite({
    functionName: 'setHatClaimabilityAndCreateModule',
    address: instanceAddress,
    enabled:
      !!instanceAddress &&
      !_.some(deployModuleAndRegisterWithClaimsHatterArgs, _.isUndefined),
    args: deployModuleAndRegisterWithClaimsHatterArgs,
    chainId,
    handlePendingTx,
    hatId: selectedHat?.id,
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

  const handleSuccess = useCallback(
    (localData: { newInstance?: Hex | null; newInstances?: Hex[] | null }) => {
      switch (deploymentType) {
        case DEPLOYMENT_TYPES.ONLY_MODULE: {
          const moduleAddress = _.get(
            localData,
            'newInstance',
            _.get(localData, 'newInstances[0]'),
          );
          if (moduleAddress && selectedModuleDetails) {
            let hatterHats: Partial<FormData>[] = [];
            if (
              instanceAddress &&
              isPermissionlesslyClaimable === 'Yes' &&
              !hatterIsAdmin
            ) {
              hatterHats = processClaimsHatter({
                claimsHatterAddress: instanceAddress,
                storedData,
                adminHat: adminHatData,
                incrementWearers,
              });
            }
            let type = MODULE_TYPES.eligibility;
            if (selectedModuleDetails.type.toggle) {
              type = MODULE_TYPES.toggle;
            }
            const moduleHats = processModule({
              moduleAddress,
              storedData,
              selectedHat,
              type,
            });
            const hatIds = _.uniq(
              _.map(_.concat(moduleHats, hatterHats), 'id'),
            );
            const updatedHats: any[] = _.map(
              hatIds,
              (id: Hex) =>
                _.merge(
                  {},
                  _.find(hatterHats, { id }),
                  _.find(moduleHats, { id }),
                ) as Partial<FormData>,
            );
            setStoredData?.(updatedHats);
            toast.success({
              title: 'Saved',
              description: `${selectedModuleDetails?.name} has been successfully deployed!`,
              duration: 1500,
            });
          }
          break;
        }
        case DEPLOYMENT_TYPES.MODULE_AND_CLAIMS_HATTER: {
          const instances = _.get(localData, 'newInstances');
          if (_.isArray(instances)) {
            const [moduleAddress, claimsHatterAddress] = instances;

            const updatedHatsWithModule = processModule({
              moduleAddress,
              storedData,
              selectedHat,
              type: MODULE_TYPES.eligibility,
            });
            const updatedHatsWithClaimsHatter = processClaimsHatter({
              claimsHatterAddress,
              storedData,
              adminHat: adminHatData,
              incrementWearers,
            });
            const hatIds = _.uniq(
              _.concat(
                _.map(updatedHatsWithModule, 'id'),
                _.map(updatedHatsWithClaimsHatter, 'id'),
              ),
            );
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
          }
          break;
        }
        case DEPLOYMENT_TYPES.ONLY_CLAIMS_HATTER: {
          const claimsHatterAddress: Hex | null | undefined = _.get(
            localData,
            'newInstance',
            _.get(localData, 'newInstances[0]', undefined),
          );
          if (!claimsHatterAddress) return;
          const updatedHats = processClaimsHatter({
            claimsHatterAddress,
            storedData,
            adminHat: adminHatData,
            incrementWearers,
          });

          setStoredData?.(updatedHats);

          toast.success({
            title: 'Saved',
            description: instanceAddress
              ? `Hat ${hatTitle} has been successfully registered!`
              : `Claims Hatter Module has been successfully deployed!`,
            duration: 1500,
          });

          break;
        }

        default:
          break;
      }
      queryClient.invalidateQueries(['claimsHatter']);
      onCloseModuleDrawer();
    },
    [
      deploymentType,
      onCloseModuleDrawer,
      selectedModuleDetails,
      storedData,
      selectedHat,
      setStoredData,
      toast,
      incrementWearers,
      adminHatData,
      instanceAddress,
      hatTitle,
      queryClient,
      hatterIsAdmin,
      isPermissionlesslyClaimable,
    ],
  );

  const { isLoading, mutateAsync } = useMutation({
    mutationFn: async () => {
      const adminHatId = BigInt(decimalId(adminHat));
      switch (deploymentType) {
        case DEPLOYMENT_TYPES.ONLY_MODULE: {
          if (
            instanceAddress &&
            isPermissionlesslyClaimable === 'Yes' &&
            _.isEmpty(selectedHat?.claimableBy)
          ) {
            return deployModuleAndRegisterWithClaimsHatter();
          }

          return deployModule({
            selectedModuleDetails,
            selectedHat,
            address,
            values,
            chainId,
            hatId,
          });
        }

        case DEPLOYMENT_TYPES.MODULE_AND_CLAIMS_HATTER:
          return deployModuleWithClaimsHatter({
            selectedModuleDetails,
            claimsHatterId: claimsHatterModule?.id,
            selectedHat,
            address,
            values,
            chainId,
            hatId,
            adminHatId,
          });

        case DEPLOYMENT_TYPES.ONLY_CLAIMS_HATTER:
          return deployClaimsHatter({
            claimsHatterModule,
            selectedHat,
            address,
            values,
            chainId,
            adminHatId,
          });

        default:
          return null;
      }
    },
    onSuccess: (localData) => {
      if (!localData) return;
      handleSuccess(localData);
    },
    onError: (error: Error) => {
      if (
        error.name === 'TransactionExecutionError' &&
        error.message.includes('User rejected the request')
      ) {
        toast.error({
          title: 'Signature rejected!',
          description: 'Please accept the transaction in your wallet',
        });
      } else {
        toast.error({
          title: 'Error!',
          description: `${error.message}`,
        });
      }
    },
  });

  return {
    deploy: mutateAsync,
    isLoading: isLoading || isLoadingMultiClaimsHatter,
  };
};

export default useModuleDeploy;

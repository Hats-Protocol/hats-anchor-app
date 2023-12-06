import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CONFIG, DEPLOYMENT_TYPES } from 'app-constants';
import { useToast } from 'app-hooks';
import {
  DeploymentType,
  FormData,
  Hat,
  ModuleDetails,
  SupportedChains,
} from 'hats-types';
import {
  decimalId,
  deployClaimsHatter,
  deployModule,
  deployModuleWithClaimsHatter,
  prepareDeployModuleAndRegisterWithClaimsHatterArgs,
  processClaimsHatter,
  processModule,
} from 'hats-utils';
import _ from 'lodash';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

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
}: {
  localForm: UseFormReturn;
  selectedHat?: Hat;
  chainId: SupportedChains;
  storedData: Partial<FormData>[];
  setStoredData?: Dispatch<SetStateAction<Partial<FormData>[]>>;
  onchainHats: Hat[];
  editMode?: boolean;
  selectedModuleDetails?: ModuleDetails;
  onCloseModuleDrawer: () => void;
  deploymentType: DeploymentType;
}) => {
  const { watch } = localForm;
  const values = watch();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { modules } = useHatsModules({ chainId });
  const { address } = useAccount();
  const hatId = BigInt(decimalId(selectedHat?.id));
  const adminHat = values?.adminHat;
  const incrementWearers = values?.incrementWearers;
  const isPermissionlesslyClaimable = values?.isPermissionlesslyClaimable;
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
    onchainHats,
    storedData,
    editMode,
  });

  const deployModuleAndRegisterWithClaimsHatterArgs =
    prepareDeployModuleAndRegisterWithClaimsHatterArgs({
      selectedModuleDetails,
      isLocalFormValid: localForm.formState.isValid,
      values,
      hatId,
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
    (data: { newInstance?: Hex | null; newInstances?: Hex[] | null }) => {
      switch (deploymentType) {
        case DEPLOYMENT_TYPES.ONLY_MODULE: {
          const moduleAddress = _.get(
            data,
            'newInstance',
            _.get(data, 'newInstances[0]'),
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
            const moduleHats = processModule({
              moduleAddress,
              storedData,
              selectedHat,
            });
            const hatIds = _.uniq(
              _.map(_.concat(moduleHats, hatterHats), 'id'),
            );
            const updatedHats = _.map(hatIds, (id: any) =>
              _.merge(
                {},
                _.find(hatterHats, { id }),
                _.find(moduleHats, { id }),
              ),
            );
            setStoredData?.(updatedHats);
            toast.success({
              title: 'Saved',
              description: `Module ${selectedModuleDetails?.name} has been successfully deployed!`,
              duration: 1500,
            });
          }
          break;
        }
        case DEPLOYMENT_TYPES.MODULE_AND_CLAIMS_HATTER: {
          const instances = _.get(data, 'newInstances');
          if (_.isArray(instances)) {
            const [moduleAddress, claimsHatterAddress] = instances;

            const updatedHatsWithModule = processModule({
              moduleAddress,
              storedData,
              selectedHat,
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
            const updatedHats = _.map(hatIds, (id: any) => {
              const hatterHat = _.find(updatedHatsWithClaimsHatter, ['id', id]);
              const moduleHat = _.find(updatedHatsWithModule, ['id', id]);
              return _.merge({}, hatterHat, moduleHat);
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
            data,
            'newInstance',
            _.get(data, 'newInstances[0]', undefined),
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
    onSuccess: (data) => {
      if (!data) return;
      handleSuccess(data);
    },
    onError: (error: Error) => {
      // TODO catch rejected signature
      toast.error({
        title: 'Error!',
        description: `${error.message}`,
      });
    },
  });

  return {
    deploy: mutateAsync,
    isLoading: isLoading || isLoadingMultiClaimsHatter,
  };
};

export default useModuleDeploy;

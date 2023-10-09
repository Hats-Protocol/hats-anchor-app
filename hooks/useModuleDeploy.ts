import { useMutation } from '@tanstack/react-query';
import _ from 'lodash';
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { CLAIMS_HATTER_ID, DEPLOYMENT_TYPES } from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useToast from '@/hooks/useToast';
import { decimalId, prettyIdToIp } from '@/lib/hats';
import {
  deployClaimsHatter,
  deployModule,
  deployModuleWithClaimsHatter,
  prepareDeployModuleWithoutClaimsHatterArgs,
  processClaimsHatter,
  processModule,
} from '@/lib/modules';
import { DeploymentType, ModuleDetails } from '@/types';

import useHatsModules from './useHatsModules';
import useMultiClaimsHatterContractWrite from './useMultiClaimsHatterContractWrite';

const useModuleDeploy = ({
  localForm,
  selectedModuleDetails,
  onCloseModuleDrawer,
  updateFormAfterDeploy,
  deploymentType,
  instanceAddress,
}: {
  localForm: UseFormReturn;
  selectedModuleDetails?: ModuleDetails;
  onCloseModuleDrawer: () => void;
  updateFormAfterDeploy: ({
    address,
    incrementWearers,
  }: {
    address?: string;
    incrementWearers?: boolean;
  }) => void;
  deploymentType: DeploymentType;
  instanceAddress?: Hex;
}) => {
  const { getValues } = localForm;
  const values = getValues();
  const toast = useToast();
  const { chainId, selectedHat, setStoredData, storedData } = useTreeForm();
  const { modules } = useHatsModules();
  const { address } = useAccount();
  const hatId = BigInt(decimalId(selectedHat?.id));
  const adminHat = values?.adminHat;
  const incrementWearers = values?.incrementWearers;
  const claimsHatterModule = modules?.[CLAIMS_HATTER_ID];
  const hatTitle = `${prettyIdToIp(selectedHat?.prettyId)} (${
    selectedHat?.detailsObject?.data?.name
  })`;

  const deployModuleWithoutClaimsHatterArgs =
    prepareDeployModuleWithoutClaimsHatterArgs({
      selectedModuleDetails,
      isLocalFormValid: localForm.formState.isValid,
      values,
      hatId,
    });

  const {
    deploy: deployModuleWithoutClaimsHatter,
    isLoading: isLoadingMultiClaimsHatter,
  } = useMultiClaimsHatterContractWrite({
    functionName: 'setHatClaimabilityAndCreateModule',
    address: instanceAddress,
    enabled: !!instanceAddress,
    args: deployModuleWithoutClaimsHatterArgs,
  });

  const { deploy: setHatClaimability, isLoading: isLoadingSetHatClaimability } =
    useMultiClaimsHatterContractWrite({
      functionName: 'setHatClaimability',
      address: instanceAddress,
      enabled: !!instanceAddress,
      args: [hatId, 1],
    });

  const handleSuccess = useCallback(
    (data: any) => {
      switch (deploymentType) {
        case DEPLOYMENT_TYPES.ONLY_MODULE:
          if (data?.newInstance && selectedModuleDetails) {
            updateFormAfterDeploy({
              address: data?.newInstance,
            });
            const updatedHats = processModule({
              moduleAddress: data?.newInstance,
              storedData,
              selectedHat,
            });
            setStoredData?.(updatedHats);
            toast.success({
              title: 'Saved',
              description: `Module ${selectedModuleDetails?.name} has been successfully deployed!`,
              duration: 1500,
            });
          }
          break;

        case DEPLOYMENT_TYPES.MODULE_AND_CLAIMS_HATTER:
          if (_.isArray(_.get(data, 'newInstances'))) {
            const [moduleAddress, claimsHatterAddress] = data.newInstances;
            updateFormAfterDeploy({
              address: data?.newInstance,
              incrementWearers,
            });

            const updatedHatsWithModule = processModule({
              moduleAddress,
              storedData,
              selectedHat,
              selectedModuleDetails,
            });
            const updatedHatsWithClaimsHatter = processClaimsHatter({
              claimsHatterAddress,
              storedData,
              adminHat,
            });
            const updatedHats = _.unionBy(
              updatedHatsWithModule,
              updatedHatsWithClaimsHatter,
              'id',
            );
            console.log(instanceAddress);
            console.log(updatedHats);
            setStoredData?.(updatedHats);

            toast.success({
              title: 'Saved',
              description: instanceAddress
                ? `Module ${selectedModuleDetails?.name} has been successfully deployed!`
                : `Module ${selectedModuleDetails?.name} and Claims Hatter Module have been successfully deployed!`,
              duration: 2500,
            });
          }
          break;

        case DEPLOYMENT_TYPES.ONLY_CLAIMS_HATTER: {
          updateFormAfterDeploy({
            incrementWearers,
          });
          const updatedHats = processClaimsHatter({
            claimsHatterAddress: data?.newInstance,
            storedData,
            adminHat,
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
      onCloseModuleDrawer();
    },
    [
      deploymentType,
      onCloseModuleDrawer,
      selectedModuleDetails,
      updateFormAfterDeploy,
      storedData,
      selectedHat,
      setStoredData,
      toast,
      values?.incrementWearers,
      adminHat,
      instanceAddress,
      hatTitle,
    ],
  );

  const { isLoading, mutateAsync } = useMutation({
    mutationFn: async () => {
      const adminHatId = BigInt(decimalId(adminHat));
      switch (deploymentType) {
        case DEPLOYMENT_TYPES.ONLY_MODULE: {
          // ? only module + hatter register `setHatClaimabilityAndCreateModule`

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
          if (instanceAddress) {
            return deployModuleWithoutClaimsHatter();
          }

          return deployModuleWithClaimsHatter({
            claimsHatterModule,
            selectedModuleDetails,
            selectedHat,
            address,
            values,
            chainId,
            hatId,
            adminHatId,
          });

        case DEPLOYMENT_TYPES.ONLY_CLAIMS_HATTER:
          if (instanceAddress) {
            return setHatClaimability();
          }
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
      handleSuccess(data);
    },
    onError: (error: Error) => {
      toast.error({
        title: 'Error!',
        description: `${error.message}`,
      });
    },
  });

  return {
    deploy: mutateAsync,
    isLoading:
      isLoading || isLoadingMultiClaimsHatter || isLoadingSetHatClaimability,
  };
};

export default useModuleDeploy;

import { useMutation, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useCallback, useMemo } from 'react';
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
  deploymentType,
  instanceAddress,
}: {
  localForm: UseFormReturn;
  selectedModuleDetails?: ModuleDetails;
  onCloseModuleDrawer: () => void;
  deploymentType: DeploymentType;
  instanceAddress?: Hex;
}) => {
  const { getValues } = localForm;
  const values = getValues();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { chainId, selectedHat, setStoredData, onchainHats, storedData } =
    useTreeForm();
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
    (data: any) => {
      switch (deploymentType) {
        case DEPLOYMENT_TYPES.ONLY_MODULE: {
          const moduleAddress: Hex | undefined = _.first(data?.newInstances);
          if (moduleAddress && selectedModuleDetails) {
            const updatedHats = processModule({
              moduleAddress,
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
        }
        case DEPLOYMENT_TYPES.MODULE_AND_CLAIMS_HATTER: {
          if (_.isArray(_.get(data, 'newInstances'))) {
            const [moduleAddress, claimsHatterAddress] = data.newInstances;

            const updatedHatsWithModule = processModule({
              moduleAddress,
              storedData,
              selectedHat,
              selectedModuleDetails,
            });
            const updatedHatsWithClaimsHatter = processClaimsHatter({
              claimsHatterAddress,
              storedData,
              adminHat: adminHatData,
              incrementWearers,
            });
            const updatedHats = _.map(updatedHatsWithClaimsHatter, (hat) => {
              const moduleHat = _.find(updatedHatsWithModule, ['id', hat.id]);
              return _.merge({}, hat, moduleHat);
            });
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
        }
        case DEPLOYMENT_TYPES.ONLY_CLAIMS_HATTER: {
          const claimsHatterAddress: Hex | undefined = _.first(
            data?.newInstances,
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
    ],
  );

  const { isLoading, mutateAsync } = useMutation({
    mutationFn: async () => {
      const adminHatId = BigInt(decimalId(adminHat));
      switch (deploymentType) {
        case DEPLOYMENT_TYPES.ONLY_MODULE: {
          if (instanceAddress && _.isEmpty(selectedHat?.claimableBy)) {
            return deployModuleWithoutClaimsHatter();
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
    isLoading: isLoading || isLoadingMultiClaimsHatter,
  };
};

export default useModuleDeploy;

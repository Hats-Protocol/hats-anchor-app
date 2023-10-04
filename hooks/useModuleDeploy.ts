import { useMutation } from '@tanstack/react-query';
import _ from 'lodash';
import { useCallback } from 'react';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { CLAIMS_HATTER_ID } from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useToast from '@/hooks/useToast';
import { decimalId } from '@/lib/hats';
import {
  deployClaimsHatter,
  deployModule,
  deployModuleWithClaimsHatter,
  prepareArgs,
  processClaimsHatter,
  processModule,
} from '@/lib/modules';
import { ModuleDetails } from '@/types';

import useHatsModules from './useHatsModules';
import useMultiClaimsHatterContractWrite from './useMultiClaimsHatterContractWrite';

const useModuleDeploy = ({
  values,
  selectedModuleDetails,
  onCloseModuleDrawer,
  updateModuleAddress,
  deploymentType,
  instanceAddress,
}: {
  values: any;
  selectedModuleDetails?: ModuleDetails;
  onCloseModuleDrawer: () => void;
  updateModuleAddress: (address: string) => void;
  deploymentType: 'single' | 'withClaimsHatter' | 'onlyClaimsHatter';
  instanceAddress?: Hex;
}) => {
  const toast = useToast();
  const { chainId, selectedHat, setStoredData, storedData } = useTreeForm();
  const { modules } = useHatsModules();
  const { address } = useAccount();
  const hatId = BigInt(decimalId(selectedHat?.id));

  const adminHat = values?.adminHat;
  const claimsHatterModule = modules?.[CLAIMS_HATTER_ID];

  const { immutableArgs, mutableArgs } = prepareArgs(
    values,
    selectedModuleDetails,
  );

  const { writeAsync } = useMultiClaimsHatterContractWrite({
    functionName: 'setHatClaimabilityAndCreateModule',
    args: [immutableArgs, mutableArgs],
    chainId,
    address: instanceAddress,
    enabled: !!instanceAddress,
  });

  const handleSuccess = useCallback(
    (data: any) => {
      switch (deploymentType) {
        case 'single':
          if (data?.newInstance && selectedModuleDetails) {
            updateModuleAddress(data?.newInstance);
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

        case 'withClaimsHatter':
          if (_.isArray(_.get(data, 'newInstances'))) {
            const [moduleAddress, claimsHatterAddress] = data.newInstances;
            updateModuleAddress(moduleAddress);

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
            setStoredData?.(updatedHats);

            toast.success({
              title: 'Saved',
              description: `Module ${selectedModuleDetails?.name} and Claims Hatter Module have been successfully deployed!`,
              duration: 1500,
            });
          }
          break;

        case 'onlyClaimsHatter': {
          const updatedHats = processClaimsHatter({
            claimsHatterAddress: data?.newInstance,
            storedData,
            adminHat,
          });

          setStoredData?.(updatedHats);

          toast.success({
            title: 'Saved',
            description: `Claims Hatter Module has been successfully deployed!`,
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
      updateModuleAddress,
      storedData,
      selectedHat,
      setStoredData,
      toast,
      adminHat,
    ],
  );

  const { isLoading, mutateAsync } = useMutation({
    mutationFn: async () => {
      const adminHatId = BigInt(decimalId(adminHat));
      switch (deploymentType) {
        case 'single': {
          if (instanceAddress) {
            return writeAsync?.();
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

        case 'withClaimsHatter':
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

        case 'onlyClaimsHatter':
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

  return { deploy: mutateAsync, isLoading };
};

export default useModuleDeploy;

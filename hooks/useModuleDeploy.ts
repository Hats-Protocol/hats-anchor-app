import { useMutation } from '@tanstack/react-query';
import _ from 'lodash';
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useAccount } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import useToast from '@/hooks/useToast';
import { claimsHatterId } from '@/lib/general';
import { decimalId } from '@/lib/hats';
import {
  deployModuleWithClaimsHatter,
  deployOnlyClaimsHatterModule,
  deploySingleModule,
  processClaimsHatter,
  processSingleModule,
} from '@/lib/modules';
import { ModuleDetails } from '@/types';

import useHatsModules from './useHatsModules';

const useDeployModule = ({
  localForm,
  selectedModuleDetails,
  onCloseModuleDrawer,
  updateModuleAddress,
  deploymentType,
}: {
  localForm: UseFormReturn;
  selectedModuleDetails?: ModuleDetails;
  onCloseModuleDrawer: () => void;
  updateModuleAddress: (address: string) => void;
  deploymentType: 'single' | 'withClaimsHatter' | 'onlyClaimsHatter';
}) => {
  const toast = useToast();
  const { chainId, selectedHat, setStoredData, storedData } = useTreeForm();
  const { modules } = useHatsModules();
  const { address } = useAccount();
  const hatId = BigInt(decimalId(selectedHat?.id));
  const { watch, getValues } = localForm;
  const values = getValues();

  const adminHat = watch('adminHat');
  const claimsHatterModule = modules?.[claimsHatterId];

  const handleSuccess = useCallback(
    (data: any) => {
      const isDataValid = _.isArray(_.get(data, 'newInstances'));

      switch (deploymentType) {
        case 'single':
          if (isDataValid) {
            const [singleModuleAddress] = data.newInstances;
            if (singleModuleAddress && selectedModuleDetails) {
              updateModuleAddress(singleModuleAddress);
              processSingleModule({
                singleModuleAddress,
                storedData,
                selectedHat,
                selectedModuleDetails,
                setStoredData,
              });
              toast.success({
                title: 'Saved',
                description: `Module ${selectedModuleDetails?.name} has been successfully deployed!`,
                duration: 1500,
              });
            }
          }
          break;

        case 'withClaimsHatter':
          if (isDataValid) {
            const [moduleAddress, claimsHatterAddress] = data.newInstances;
            processSingleModule({
              singleModuleAddress: moduleAddress,
              storedData,
              selectedHat,
              selectedModuleDetails,
              setStoredData,
            });
            toast.success({
              title: 'Saved',
              description: `Module ${selectedModuleDetails?.name} has been successfully deployed!`,
              duration: 1500,
            });
            processClaimsHatter({
              claimsHatterAddress,
              setStoredData,
              storedData,
              adminHat,
            });

            toast.success({
              title: 'Saved',
              description: `Claims Hatter Module has been successfully deployed!`,
              duration: 1500,
            });
          }
          break;

        case 'onlyClaimsHatter':
          if (isDataValid) {
            const claimsHatterAddress = data.newInstance;
            processClaimsHatter({
              claimsHatterAddress,
              setStoredData,
              storedData,
              adminHat,
            });

            toast.success({
              title: 'Saved',
              description: `Claims Hatter Module has been successfully deployed!`,
              duration: 1500,
            });
          }
          break;

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
      switch (deploymentType) {
        case 'single':
          deploySingleModule({
            selectedModuleDetails,
            selectedHat,
            address,
            values,
            chainId,
            hatId,
          });
          break;

        case 'withClaimsHatter':
          deployModuleWithClaimsHatter({
            claimsHatterModule,
            selectedModuleDetails,
            selectedHat,
            address,
            values,
            chainId,
            hatId,
            adminHat,
          });
          break;

        case 'onlyClaimsHatter':
          deployOnlyClaimsHatterModule({
            claimsHatterModule,
            selectedHat,
            address,
            values,
            chainId,
            hatId,
          });
          break;

        default:
          break;
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

export default useDeployModule;

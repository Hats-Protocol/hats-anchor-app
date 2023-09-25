import { useMutation } from '@tanstack/react-query';
import { UseFormReturn } from 'react-hook-form';
import { useAccount } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import useToast from '@/hooks/useToast';
import { claimsHatterId, transformInput } from '@/lib/general';
import { decimalId } from '@/lib/hats';
import { createHatsModulesClient } from '@/lib/web3';
import { ModuleDetails } from '@/types';

import useHatsModules from './useHatsModules';

const useDeployModule = ({
  localForm,
  selectedModuleDetails,
}: {
  localForm: UseFormReturn;
  selectedModuleDetails?: ModuleDetails;
}) => {
  const toast = useToast();
  const { chainId, selectedHat } = useTreeForm();
  const { modules } = useHatsModules();
  const { address } = useAccount();
  const hatId = BigInt(decimalId(selectedHat?.id));
  const { watch, getValues } = localForm;

  const adminHat = watch('adminHat');
  const claimsHatterModule = modules?.[claimsHatterId];

  const { isLoading, mutateAsync } = useMutation({
    mutationFn: async () => {
      if (
        selectedModuleDetails &&
        selectedHat?.id &&
        address &&
        claimsHatterModule
      ) {
        const values = getValues();

        const immutableArgs = selectedModuleDetails.creationArgs.immutable.map(
          ({ name, type }) => transformInput(values[name], type),
        );

        const mutableArgs = selectedModuleDetails.creationArgs.mutable.map(
          ({ name, type }) => transformInput(values[name], type),
        );

        const hatsClient = await createHatsModulesClient(chainId);

        const claimsImmutableArgs =
          claimsHatterModule.creationArgs.immutable.map(({ name, type }) =>
            transformInput(values[name], type),
          );
        const claimsMutableArgs = claimsHatterModule.creationArgs.mutable.map(
          ({ name, type }) => transformInput(values[name], type),
        );

        return hatsClient?.batchCreateNewInstances({
          account: address,
          moduleIds: [selectedModuleDetails.id, claimsHatterId],
          hatIds: [hatId, BigInt(decimalId(adminHat))],
          immutableArgsArray: [immutableArgs, claimsImmutableArgs],
          mutableArgsArray: [mutableArgs, claimsMutableArgs],
        });
      }
      return null;
    },
    onSuccess: () => {
      toast.success({
        title: 'Saved',
        description: `Module ${selectedModuleDetails?.name} and Claims Hatter Module have been successfully deployed!`,
        duration: 1500,
      });
    },
    onError: (error: Error) => {
      toast.error({
        title: 'Error!',
        description: `${error.message}`,
      });
    },
  });

  const deployModule = () => {
    mutateAsync();
  };

  return { deployModule, isLoading };
};

export default useDeployModule;

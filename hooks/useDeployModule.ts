import { useAccount } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import useToast from '@/hooks/useToast';
import { claimsHatterAddress, transformInput } from '@/lib/general';
import { decimalId } from '@/lib/hats';
import { createHatsModulesClient } from '@/lib/web3';
import { ModuleDetails } from '@/types';

import useHatsModules from './useHatsModules';

const useDeployModule = ({
  localForm,
  selectedModuleDetails,
}: {
  localForm: any;
  selectedModuleDetails?: ModuleDetails;
}) => {
  const toast = useToast();
  const { chainId, selectedHat } = useTreeForm();
  const { modules } = useHatsModules();
  const { address } = useAccount();
  const hatId = BigInt(decimalId(selectedHat?.id));
  const { watch, getValues } = localForm;

  const adminHat = watch('adminHat');

  const deployModule = async () => {
    try {
      if (selectedModuleDetails && selectedHat?.id && address && modules) {
        const claimsHatterModule = modules[claimsHatterAddress];

        const values = getValues();

        const immutableArgs = selectedModuleDetails.creationArgs.immutable.map(
          ({ name, type }) => transformInput(values[name], type),
        );

        const mutableArgs = selectedModuleDetails.creationArgs.mutable.map(
          ({ name, type }) => transformInput(values[name], type),
        );

        const hatsClient = await createHatsModulesClient(chainId);

        // if (hatterExists) {
        const claimsImmutableArgs =
          claimsHatterModule.creationArgs.immutable.map(({ name, type }) =>
            transformInput(values[name], type),
          );
        const claimsMutableArgs = claimsHatterModule.creationArgs.mutable.map(
          ({ name, type }) => transformInput(values[name], type),
        );

        // console.log('selectedModuleDetails.id', selectedModuleDetails.id);
        // console.log('claimsHatterAddress', claimsHatterAddress);
        // console.log('hatId', hatId);
        // console.log('BigInt(decimalId(adminHat))', BigInt(decimalId(adminHat)));
        // console.log('[immutableArgs, claimsImmutableArgs]', [
        //   immutableArgs,
        //   claimsImmutableArgs,
        // ]);
        // console.log('[mutableArgs, claimsMutableArgs]', [
        //   mutableArgs,
        //   claimsMutableArgs,
        // ]);

        const createInstancesResult = await hatsClient?.batchCreateNewInstances(
          {
            account: address,
            moduleIds: [selectedModuleDetails.id, claimsHatterAddress],
            hatIds: [hatId, BigInt(decimalId(adminHat))],
            immutableArgsArray: [immutableArgs, claimsImmutableArgs],
            mutableArgsArray: [mutableArgs, claimsMutableArgs],
          },
        );

        console.log('createInstancesResult', createInstancesResult);

        toast.success({
          title: 'Saved',
          description: `Module ${selectedModuleDetails.name} and Claims Hatter Module have been successfully deployed!`,
          duration: 1500,
        });
        // } else {
        //   const createInstanceResult = await hatsClient?.createNewInstance({
        //     account: address,
        //     moduleId: selectedModuleDetails.id,
        //     hatId,
        //     immutableArgs,
        //     mutableArgs,
        //   });

        //   toast.success({
        //     title: 'Saved',
        //     description: `Module ${selectedModuleDetails.name} has been successfully deployed!`,
        //     duration: 1500,
        //   });
        // }
      }
    } catch (error) {
      const err = error as Error;
      toast.error({
        title: 'Error!',
        description: `${err.message}`,
      });
    }
  };

  return { deployModule };
};

export default useDeployModule;

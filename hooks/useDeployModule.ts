import { useAccount } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import useToast from '@/hooks/useToast';
import { transformInput } from '@/lib/general';
import { decimalId } from '@/lib/hats';
import { createHatsModulesClient } from '@/lib/web3';
import { SelectedModuleDetails } from '@/types';

const useDeployModule = ({
  localForm,
  selectedModuleDetails,
}: {
  localForm: any;
  selectedModuleDetails?: SelectedModuleDetails;
}) => {
  const toast = useToast();
  const { chainId, selectedHat } = useTreeForm();
  const { address } = useAccount();
  const hatId = BigInt(decimalId(selectedHat?.id));

  const deployModule = async () => {
    try {
      if (selectedModuleDetails && selectedHat?.id && address) {
        const values = localForm.getValues();

        const immutableArgs = selectedModuleDetails.creationArgs.immutable.map(
          ({ name, type }) => transformInput(values[name], type),
        );

        const mutableArgs = selectedModuleDetails.creationArgs.mutable.map(
          ({ name, type }) => transformInput(values[name], type),
        );

        const hatsClient = await createHatsModulesClient(chainId);

        const createInstanceResult = await hatsClient?.createNewInstance({
          account: address,
          moduleId: selectedModuleDetails.id,
          hatId,
          immutableArgs,
          mutableArgs,
        });
        console.log('createInstanceResult', createInstanceResult);

        toast.success({
          title: 'Saved',
          description: `Module ${selectedModuleDetails.name} has been successfully deployed!`,
          duration: 1500,
        });
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

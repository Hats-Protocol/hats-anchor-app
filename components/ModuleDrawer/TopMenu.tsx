import { Button, Flex, HStack, Icon } from '@chakra-ui/react';
import { BsBoxArrowRight, BsXSquare } from 'react-icons/bs';
import { useAccount } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import useToast from '@/hooks/useToast';
import { transformInput } from '@/lib/general';
import { decimalId } from '@/lib/hats';
import { createHatsModulesClient } from '@/lib/web3';
import { SelectedModuleDetails } from '@/types';

const TopMenu = ({
  localForm,
  onCloseModuleDrawer,
  selectedModuleDetails,
}: {
  localForm: any;
  onCloseModuleDrawer: () => void;
  selectedModuleDetails?: SelectedModuleDetails;
}) => {
  const { chainId, selectedHat } = useTreeForm();
  const toast = useToast();
  const { address } = useAccount();
  const hatsClient = createHatsModulesClient(chainId);
  const hatId = BigInt(decimalId(selectedHat?.id));

  const deployModule = async () => {
    try {
      if (selectedModuleDetails && selectedHat?.id && address && hatsClient) {
        const values = localForm.getValues();

        const immutableArgs = selectedModuleDetails.creationArgs.immutable.map(
          ({ name, type }) => transformInput(values[name], type),
        );

        const mutableArgs = selectedModuleDetails.creationArgs.mutable.map(
          ({ name, type }) => transformInput(values[name], type),
        );

        await hatsClient.prepare();

        const createInstanceResult = await hatsClient.createNewInstance({
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
        description: `${err.message}}`,
      });
    }
  };

  return (
    <Flex
      w='100%'
      borderBottom='1px solid'
      borderColor='gray.200'
      h='75px'
      bg='whiteAlpha.900'
      align='center'
      justify='space-between'
      px={4}
      position='absolute'
      top={0}
      zIndex={16}
    >
      <Button
        variant='outline'
        borderColor='gray.300'
        onClick={onCloseModuleDrawer}
        leftIcon={<Icon as={BsXSquare} />}
      >
        Cancel
      </Button>

      <HStack spacing={3}>
        <Button
          leftIcon={<BsBoxArrowRight />}
          colorScheme='twitter'
          variant='solid'
          isDisabled={!localForm?.formState.isValid}
          onClick={() => {
            deployModule();
          }}
        >
          Deploy & Return
        </Button>
      </HStack>
    </Flex>
  );
};

export default TopMenu;

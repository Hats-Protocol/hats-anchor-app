import { Button, Flex, HStack, Icon } from '@chakra-ui/react';
import { BsBoxArrowRight, BsXSquare } from 'react-icons/bs';

import useDeployModule from '@/hooks/useDeployModule';
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
  const { deployModule } = useDeployModule({
    localForm,
    selectedModuleDetails,
  });

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

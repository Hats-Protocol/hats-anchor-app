import { Button, Flex, HStack, Icon } from '@chakra-ui/react';
import { BsBoxArrowRight, BsXSquare } from 'react-icons/bs';

const TopMenu = ({
  localForm,
  onCloseModuleDrawer,
}: {
  localForm: any;
  onCloseModuleDrawer: () => void;
}) => {
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
            // toast for save
            onCloseModuleDrawer();
          }}
        >
          Deploy & Return
        </Button>
      </HStack>
    </Flex>
  );
};

export default TopMenu;

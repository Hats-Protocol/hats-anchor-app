import { Button, Flex, HStack, Icon } from '@chakra-ui/react';
import { BsXSquare } from 'react-icons/bs';
import { FiMoreVertical, FiSave } from 'react-icons/fi';

const TopMenu = ({
  onCloseModuleDrawer,
}: {
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
        colorScheme='gray'
        onClick={onCloseModuleDrawer}
        leftIcon={<Icon as={BsXSquare} />}
      >
        Cancel
      </Button>

      <HStack spacing={3}>
        <Button
          leftIcon={<FiMoreVertical />}
          colorScheme='gray'
          variant='outline'
          onClick={() => {
            console.log('more');
          }}
        >
          More
        </Button>
        <Button
          leftIcon={<FiSave />}
          colorScheme='twitter'
          variant='solid'
          onClick={() => {
            // toast for save
            onCloseModuleDrawer();
          }}
        >
          Save Changes
        </Button>
      </HStack>
    </Flex>
  );
};

export default TopMenu;

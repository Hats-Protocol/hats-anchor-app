import { Button, Flex } from '@chakra-ui/react';

const TopMenu = ({ editMode, setEditMode, onClose }: TopMenuProps) => {
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
        variant='link'
        colorScheme='blue'
        onClick={() => {
          setEditMode(false);
          onClose();
        }}
      >
        {editMode ? 'Cancel' : 'Edit'}
      </Button>
    </Flex>
  );
};

export default TopMenu;

interface TopMenuProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  onClose: () => void;
}

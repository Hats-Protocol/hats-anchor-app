import { Button, Flex, HStack } from '@chakra-ui/react';
import { FiSave, FiShare2 } from 'react-icons/fi';
import { FaSave } from 'react-icons/fa';
import { IoExitOutline } from 'react-icons/io5';
import { BsXSquare } from 'react-icons/bs';

const TopMenu = ({ editMode, setEditMode, onClose }: TopMenuProps) => {
  const handleShareDraft = () => {};

  const handleSave = () => {};

  const handleDeploy = () => {};

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
        onClick={() => {
          setEditMode(false);
          onClose();
        }}
        leftIcon={editMode ? <BsXSquare /> : <FaSave />}
      >
        {editMode ? 'Cancel' : 'Edit'}
      </Button>

      <HStack spacing={3}>
        <Button
          leftIcon={<FiShare2 />}
          colorScheme='gray'
          variant='outline'
          onClick={handleShareDraft}
        >
          Share Draft
        </Button>
        <Button
          leftIcon={<FiSave />}
          colorScheme='twitter'
          variant='solid'
          onClick={handleSave}
        >
          Save
        </Button>
        <Button
          leftIcon={<IoExitOutline />}
          colorScheme='blue'
          variant='solid'
          onClick={handleDeploy}
        >
          Deploy
        </Button>
      </HStack>
    </Flex>
  );
};

export default TopMenu;

interface TopMenuProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  onClose: () => void;
}

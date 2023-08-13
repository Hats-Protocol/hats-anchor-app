import { Button, Flex, IconButton } from '@chakra-ui/react';
import { FiSave, FiShare2, FiStopCircle } from 'react-icons/fi';
import { FaCross, FaSave, FaStopCircle } from 'react-icons/fa';
import { IoEnterSharp, IoExitOutline } from 'react-icons/io5';
import { BsStopBtn, BsX, BsXCircle, BsXSquare } from 'react-icons/bs';

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

      <Flex>
        <Button
          leftIcon={<FiShare2 />}
          colorScheme='gray'
          variant='outline'
          onClick={handleShareDraft}
          mr={2}
        >
          Share Draft
        </Button>
        <Button
          leftIcon={<FiSave />}
          colorScheme='teal'
          variant='solid'
          onClick={handleSave}
          mr={2}
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
      </Flex>
    </Flex>
  );
};

export default TopMenu;

interface TopMenuProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  onClose: () => void;
}

import {
  Button,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { FiSave, FiShare2 } from 'react-icons/fi';
import { FaSave } from 'react-icons/fa';
import { IoExitOutline } from 'react-icons/io5';
import { BsXSquare } from 'react-icons/bs';
import { IHat } from '@/types';
import { generateLocalStorageKey } from '@/lib/general';

const TopMenu = ({
  editMode,
  setEditMode,
  onClose,
  chainId,
  tree,
}: TopMenuProps) => {
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();

  const handleImport = () => {};

  const handleExport = () => {};

  const handleDeploy = () => {};

  const promptForReset = () => {
    onOpen();
  };

  const confirmReset = () => {
    tree.forEach((hat) => {
      const localStorageKey = generateLocalStorageKey(hat.id, chainId);
      localStorage.removeItem(localStorageKey);
    });
    closeModal();
    setEditMode(false);
    onClose();
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
        colorScheme='gray'
        onClick={promptForReset}
        leftIcon={editMode ? <BsXSquare /> : <FaSave />}
      >
        {editMode ? 'Cancel' : 'Edit'}
      </Button>

      <HStack spacing={3}>
        <Button
          leftIcon={<FiShare2 />}
          colorScheme='gray'
          variant='outline'
          onClick={handleImport}
        >
          Import
        </Button>
        <Button
          leftIcon={<FiSave />}
          colorScheme='twitter'
          variant='solid'
          onClick={handleExport}
        >
          Export
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

      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reset Changes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to reset all current changes?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='red' mr={3} onClick={confirmReset}>
              Confirm
            </Button>
            <Button variant='ghost' onClick={closeModal}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default TopMenu;

interface TopMenuProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  onClose: () => void;
  chainId: number;
  tree: IHat[];
}

import {
  Button,
  Flex,
  HStack,
  Modal as ChakraModal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { treeIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { BsXSquare } from 'react-icons/bs';
import { FaSave } from 'react-icons/fa';
import { FiSave, FiShare2 } from 'react-icons/fi';
import { IoExitOutline } from 'react-icons/io5';

import Modal from '@/components/atoms/Modal';
import { useOverlay } from '@/contexts/OverlayContext';
import ImportTreeForm from '@/forms/ImportTreeForm';
import useToast from '@/hooks/useToast';
import { generateLocalStorageKey } from '@/lib/general';
import { editHasUpdates } from '@/lib/hats';
import { IHat } from '@/types';

const TopMenu = ({
  editMode,
  setEditMode,
  onClose,
  chainId,
  treeId,
  storedData,
  setStoredData,
}: TopMenuProps) => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();
  const toast = useToast();
  const decimalTreeId = treeIdHexToDecimal(treeId);

  const openImportModal = () => {
    setModals?.({ importFile: true });
  };

  const handleExport = () => {
    const fileData = JSON.stringify(storedData);
    const blob = new Blob([fileData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    // todo add unix timestamp so don't get (1) on subsequent downloads
    // update file name validation also, based on this ^
    link.download = `chain-${chainId}-tree-${decimalTreeId}.json`;
    link.href = url;
    link.click();
    toast.success({
      title: `Exported tree #${decimalTreeId} to your desktop`,
    });
  };

  const handleDeploy = () => {};

  const promptForReset = () => {
    if (editHasUpdates(storedData)) {
      onOpen();
    } else {
      setEditMode(!editMode);
      onClose();
    }
  };

  const confirmReset = () => {
    const localStorageKey = generateLocalStorageKey(chainId, treeId);
    localStorage.removeItem(localStorageKey);
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
          onClick={openImportModal}
        >
          Import
        </Button>
        <Button
          leftIcon={<FiSave />}
          colorScheme='twitter'
          variant='solid'
          isDisabled={!editHasUpdates(storedData)}
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

      <Modal
        name='importFile'
        title='Import Draft Tree Changes'
        localOverlay={localOverlay}
      >
        <ImportTreeForm
          treeId={treeId}
          chainId={chainId}
          setStoredData={setStoredData}
        />
      </Modal>
      <ChakraModal isOpen={isOpen} onClose={closeModal}>
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
      </ChakraModal>
    </Flex>
  );
};

export default TopMenu;

interface TopMenuProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  onClose: () => void;
  chainId: number;
  treeId: string;
  storedData: Partial<IHat>[];
  setStoredData: (v: any) => void;
}

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Modal as ChakraModal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { treeIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { BsXSquare } from 'react-icons/bs';
import { FaSave } from 'react-icons/fa';
import { FiSave, FiShare2 } from 'react-icons/fi';
import { IoExitOutline } from 'react-icons/io5';

import { useOverlay } from '@/contexts/OverlayContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import useToast from '@/hooks/useToast';
import { generateLocalStorageKey } from '@/lib/general';

import DropZone from '../atoms/DropZone';
import Modal from '../atoms/Modal';

const TopMenu = ({
  editMode,
  setEditMode,
  onClose,
  chainId,
  treeId,
  storedDataString,
  setStoredDataString,
}: TopMenuProps) => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();
  const toast = useToast();
  const decimalTreeId = treeIdHexToDecimal(treeId);

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: { json: ['.json'] },
    onDrop: (a) => {
      const reader = new FileReader();
      // eslint-disable-next-line func-names
      reader.onload = function (e: any) {
        const contents = e.target?.result;
        setStoredDataString(contents);
        setModals?.({});
      };
      reader.readAsText(a[0]);
    },
  });

  const handleImport = () => {
    setModals?.({ importFile: true });
  };

  const handleExport = () => {
    const fileData = storedDataString;
    const blob = new Blob([fileData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    // todo add unix timestamp
    link.download = `chain-${chainId}-tree-${decimalTreeId}.json`;
    link.href = url;
    link.click();
    toast.success({
      title: `Exported tree #${decimalTreeId} to your desktop`,
    });
  };

  const handleDeploy = () => {};

  const promptForReset = () => {
    onOpen();
  };

  const confirmReset = () => {
    const localStorageKey = generateLocalStorageKey(chainId, treeId);
    localStorage.removeItem(localStorageKey);
    closeModal();
    setEditMode(false);
    onClose();
  };

  // useEffect(() => {

  // })

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

      <Modal
        name='importFile'
        title='Import Draft Tree Changes'
        localOverlay={localOverlay}
      >
        <Stack spacing={4}>
          <Text>Upload a Draft Hat Tree to continue editing or deployment</Text>
          <Text>
            Any local changes in your workspace will be overwritten and cannot
            be restored. Make sure to export these changes before importing.
          </Text>
          <Stack>
            <Heading size='xs'>UPLOAD JSON FILE</Heading>
            <Text>
              Add a JSON file exported by you or someone else in your
              organization
            </Text>
            <DropZone
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isFullWidth
            />
          </Stack>
        </Stack>
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
  storedDataString: string;
  setStoredDataString: (v: string) => void;
}

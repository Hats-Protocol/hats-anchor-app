import {
  Box,
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
import _ from 'lodash';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { BsXSquare } from 'react-icons/bs';
import { FaSave } from 'react-icons/fa';
import { FiSave, FiShare2 } from 'react-icons/fi';
import { IoExitOutline } from 'react-icons/io5';

import { useOverlay } from '@/contexts/OverlayContext';
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
}: TopMenuProps) => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();
  const toast = useToast();
  const [treeFile, setTreeFile] = useState<any>();
  console.log(treeFile);

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
        setTreeFile(JSON.parse(contents));
      };
      reader.readAsText(a[0]);
    },
  });

  const handleImport = () => {
    setModals?.({ importFile: true });
  };

  const handleExport = () => {
    const treeId = treeIdHexToDecimal(_.get(_.first(tree), 'treeId') || '0');
    const fileData = JSON.stringify({ name: 'test', description: 'testing' });
    const blob = new Blob([fileData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `chain-${chainId}-tree-${treeId}.json`;
    link.href = url;
    link.click();
    toast.success({
      title: `Exported tree #${treeId} to your desktop`,
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
        title='Import a Tree File'
        localOverlay={localOverlay}
      >
        <Box>
          <DropZone
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isFullWidth
          />
        </Box>
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
}

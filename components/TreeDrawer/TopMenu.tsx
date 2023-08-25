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
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { treeIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { BsXSquare } from 'react-icons/bs';
import { FaSave } from 'react-icons/fa';
import { FiSave, FiShare2 } from 'react-icons/fi';
import { IoExitOutline } from 'react-icons/io5';
import { useAccount } from 'wagmi';

import Modal from '@/components/atoms/Modal';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import ImportTreeForm from '@/forms/ImportTreeForm';
import useMulticallCallManyHats from '@/hooks/useMulticallManyHats';
import useToast from '@/hooks/useToast';
import { generateLocalStorageKey } from '@/lib/general';
import { editHasUpdates } from '@/lib/hats';
import { IHat } from '@/types';

const TopMenu = () => {
  const { address } = useAccount();
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();
  const {
    chainId,
    treeId,
    topHat,
    onchainHats,
    editMode,
    setEditMode,
    storedData,
    treeDisclosure,
  } = useTreeForm();
  const toast = useToast();
  const decimalTreeId = treeId && treeIdHexToDecimal(treeId);
  const { onSubmit, isLoading } = useMulticallCallManyHats({
    chainId,
    treeId,
    onchainHats,
  });

  const { onClose: onCloseTreeDrawer } = _.pick(treeDisclosure, ['onOpen']);

  const openImportModal = () => {
    setModals?.({ importFile: true });
  };

  const handleExport = () => {
    const fileData = JSON.stringify(storedData);
    const blob = new Blob([fileData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    // TODO add unix timestamp so don't get (1) on subsequent downloads
    // update file name validation also, based on this ^
    link.download = `chain-${chainId}-tree-${decimalTreeId}.json`;
    link.href = url;
    link.click();
    toast.success({
      title: `Exported tree #${decimalTreeId} to your desktop`,
    });
  };

  const handleDeploy = async () => {
    const result = await onSubmit();
    if (result) {
      setEditMode?.(false);
      onCloseTreeDrawer?.();
    }
  };

  const promptForReset = () => {
    if (editHasUpdates(storedData)) {
      onOpen();
    } else {
      setEditMode?.(!editMode);
      onCloseTreeDrawer?.();
    }
  };

  const confirmReset = () => {
    const localStorageKey = generateLocalStorageKey(chainId, treeId);
    localStorage.removeItem(localStorageKey);
    closeModal();
    setEditMode?.(false);
    onCloseTreeDrawer?.();
  };

  const wearingTopHat = _.includes(
    _.map(topHat?.wearers, 'id'),
    _.toLower(address),
  );

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
        <Tooltip
          label={
            !wearingTopHat &&
            'Only top hat can deploy directly currently. Submit the transaction data to your DAO'
          }
        >
          <Button
            leftIcon={<IoExitOutline />}
            colorScheme='blue'
            variant='solid'
            isDisabled={
              !wearingTopHat || !editHasUpdates(storedData) || isLoading
            }
            onClick={handleDeploy}
          >
            Deploy
          </Button>
        </Tooltip>
      </HStack>

      <Modal
        name='importFile'
        title='Import Draft Tree Changes'
        localOverlay={localOverlay}
      >
        <ImportTreeForm />
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
  onClose: () => void;
}

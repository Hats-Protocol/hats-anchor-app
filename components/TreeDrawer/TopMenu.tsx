import {
  Button,
  Flex,
  HStack,
  Icon,
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
import { useMemo } from 'react';
import { FaSave } from 'react-icons/fa';
import { FiSave, FiShare2 } from 'react-icons/fi';
import { IoExitOutline } from 'react-icons/io5';
import { useAccount, useChainId } from 'wagmi';

import Modal from '@/components/atoms/Modal';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import ImportTreeForm from '@/forms/ImportTreeForm';
import useMulticallCallManyHats from '@/hooks/useMulticallManyHats';
import useToast from '@/hooks/useToast';
import useWearerDetails from '@/hooks/useWearerDetails';
import { editHasUpdates, isAncestor, isWearer } from '@/lib/hats';
import { chainsMap } from '@/lib/web3';
import { IHat } from '@/types';

const TopMenu = () => {
  const { address } = useAccount();
  const currentChain = useChainId();
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();
  const {
    chainId,
    treeId,
    editMode,
    setEditMode,
    storedData,
    treeDisclosure,
    resetTree,
    setSelectedOption,
    treeToDisplay,
  } = useTreeForm();
  const toast = useToast();
  const decimalTreeId = treeId && treeIdHexToDecimal(treeId);
  const { writeAsync, isLoading } = useMulticallCallManyHats();
  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const { onClose: onCloseTreeDrawer } = _.pick(treeDisclosure, ['onClose']);

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
    const result = await writeAsync?.();
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
      setSelectedOption?.('wearers');
    }
  };

  const confirmReset = () => {
    resetTree?.();
    closeModal();
  };

  const isAdminOfAllHatsWithChanges = useMemo(() => {
    const hatsWithChanges = _.map(storedData, ({ id }) => {
      const foundHat = _.find(treeToDisplay, { id });
      return {
        id: foundHat?.id,
        adminId: foundHat?.admin?.id,
      };
    });

    const hasAdminOverAllHats = _.some(hatsWithChanges, (hat) => {
      return _.every(
        hatsWithChanges,
        (h) => h.id === hat.id || isAncestor(hat.id, h.id, treeToDisplay),
      );
    });

    if (hasAdminOverAllHats) {
      return true;
    }

    const parentIdsOfHatsWithChanges = _.map(hatsWithChanges, 'adminId');
    const commonParent = _.head(_.intersection(...parentIdsOfHatsWithChanges));

    if (isWearer(_.map(wearer, 'id'), commonParent)) {
      return true;
    }

    let currentParentId = commonParent;
    while (currentParentId) {
      const hat = _.find(treeToDisplay, { id: currentParentId });
      if (isWearer(_.map(wearer, 'id'), (hat as IHat)?.id)) {
        return true;
      }
      currentParentId = (hat as IHat)?.parentId;
    }

    return false;
  }, [storedData, treeToDisplay, wearer]);

  const getDeployTooltipLabel = useMemo(() => {
    if (!storedData?.length) {
      return 'No changes have been made.';
    }
    if (chainId !== currentChain) {
      return `Must be on ${chainsMap(chainId).name} to deploy`;
    }
    if (!isAdminOfAllHatsWithChanges) {
      return 'You must be the admin of all hats with changes to deploy';
    }
    return '';
  }, [chainId, currentChain, isAdminOfAllHatsWithChanges, storedData]);

  const isDeployDisabled = useMemo(
    () =>
      (!editHasUpdates(storedData) || isLoading || currentChain !== chainId) &&
      !isAdminOfAllHatsWithChanges,
    [storedData, isLoading, currentChain, chainId, isAdminOfAllHatsWithChanges],
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
        leftIcon={<Icon as={FaSave} />}
      >
        Cancel
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
          label={isDeployDisabled ? getDeployTooltipLabel : ''}
          placement='left'
          hasArrow
        >
          <Button
            leftIcon={<IoExitOutline />}
            colorScheme='blue'
            variant='solid'
            isDisabled={isDeployDisabled}
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

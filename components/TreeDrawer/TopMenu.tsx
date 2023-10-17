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
import _ from 'lodash';
import { useMemo } from 'react';
import { BsXSquare } from 'react-icons/bs';
import { IoExitOutline } from 'react-icons/io5';
import { useAccount, useChainId } from 'wagmi';

import Modal from '@/components/atoms/Modal';
import NetworkSwitcher from '@/components/NetworkSwitcher';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import ImportTreeForm from '@/forms/ImportTreeForm';
import useMulticallCallManyHats from '@/hooks/useMulticallManyHats';
import useWearerDetails from '@/hooks/useWearerDetails';
import { editHasUpdates, isWearingAdminHat } from '@/lib/hats';
import { chainsMap } from '@/lib/web3';

const TopMenu = () => {
  const { address } = useAccount();
  const currentChain = useChainId();
  const localOverlay = useOverlay();
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();
  const {
    chainId,
    editMode,
    setEditMode,
    storedData,
    treeDisclosure,
    resetTree,
    setSelectedOption,
    treeToDisplay,
  } = useTreeForm();
  const { writeAsync, isLoading } = useMulticallCallManyHats();
  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const { onClose: onCloseTreeDrawer } = _.pick(treeDisclosure, ['onClose']);

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

    // ! gets stuck if wearer details cached after new tree deploy
    const hasAdminOverAllHats = _.every(hatsWithChanges, (h) => {
      return isWearingAdminHat(_.map(wearer, 'id'), h.id, false);
    });

    if (hasAdminOverAllHats) {
      return true;
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
      !editHasUpdates(storedData) ||
      isLoading ||
      currentChain !== chainId ||
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
        leftIcon={<Icon as={BsXSquare} />}
      >
        Cancel
      </Button>
      <HStack>
        <NetworkSwitcher />
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

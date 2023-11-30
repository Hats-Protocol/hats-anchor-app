import {
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
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
import { BsChevronDoubleRight, BsXSquare } from 'react-icons/bs';
import { IoExitOutline } from 'react-icons/io5';
import { Hex } from 'viem';
import { useChainId } from 'wagmi';

import Modal from '@/components/atoms/Modal';
import NetworkSwitcher from '@/components/NetworkSwitcher';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import ImportTreeForm from '@/forms/ImportTreeForm';
import useAdminOfHats from '@/hooks/useAdminOfHats';
import useMulticallCallManyHats from '@/hooks/useMulticallManyHats';
import { chainsMap } from '@/lib/chains';
import { editHasUpdates } from '@/lib/hats';

const TopMenu = () => {
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
    selectedHat,
  } = useTreeForm();
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

  const hatIds = _.filter(
    _.map(storedData, 'id'),
    (hatId: Hex) => hatId !== undefined,
  ) as Hex[];

  const { adminHatIds } = useAdminOfHats(hatIds);

  const isAdminOfAnyHatWithChanges = useMemo(() => {
    const hatsWithChangesIds = _.map(storedData, 'id');

    const hasAdminOverAnyHat = _.some(hatsWithChangesIds, (id: Hex) =>
      _.includes(adminHatIds, id),
    );

    return hasAdminOverAnyHat;
  }, [storedData, adminHatIds]);

  const { writeAsync, isLoading } = useMulticallCallManyHats(
    isAdminOfAnyHatWithChanges,
  );

  const getDeployTooltipLabel = useMemo(() => {
    if (!storedData?.length) {
      return 'No changes have been made.';
    }
    if (chainId !== currentChain) {
      return `Must be on ${chainsMap(chainId).name} to deploy`;
    }
    if (!isAdminOfAnyHatWithChanges) {
      return 'You must be the admin of at least one hat with changes to deploy';
    }
    return '';
  }, [chainId, currentChain, isAdminOfAnyHatWithChanges, storedData]);

  const isDeployDisabled = useMemo(
    () =>
      !editHasUpdates(storedData) ||
      isLoading ||
      currentChain !== chainId ||
      !isAdminOfAnyHatWithChanges,
    [storedData, isLoading, currentChain, chainId, isAdminOfAnyHatWithChanges],
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
      <HStack>
        <Button
          variant='outline'
          onClick={promptForReset}
          leftIcon={<Icon as={BsXSquare} />}
        >
          Cancel
        </Button>
        {chainId === selectedHat?.chainId ? (
          <Button
            variant='outline'
            onClick={onCloseTreeDrawer}
            rightIcon={<Icon as={BsChevronDoubleRight} />}
          >
            Close
          </Button>
        ) : (
          <Tooltip label='Close'>
            <IconButton
              variant='outline'
              onClick={onCloseTreeDrawer}
              aria-label='Close'
              icon={<Icon as={BsChevronDoubleRight} />}
            />
          </Tooltip>
        )}
      </HStack>
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

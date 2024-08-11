'use client';

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
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useAdminOfHats, useMulticallManyHats } from 'hats-hooks';
import { editHasUpdates } from 'hats-utils';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { BsChevronDoubleRight, BsXSquare } from 'react-icons/bs';
import { IoExitOutline } from 'react-icons/io5';
import { chainsMap } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

const NetworkSwitcher = dynamic(() =>
  import('molecules').then((mod) => mod.NetworkSwitcher),
);

const TopMenu = () => {
  const currentChain = useChainId();
  const { address } = useAccount();
  const { handlePendingTx } = useOverlay();
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();
  const {
    chainId,
    treeId,
    editMode,
    setEditMode,
    storedData,
    resetTree,
    treeToDisplay,
    onchainHats,
    setStoredData,
    setSelectedOption,
    onCloseTreeDrawer,
  } = useTreeForm();
  const { selectedHat } = useSelectedHat();

  const hatIds = _.filter(
    _.map(storedData, 'id'),
    (hatId: Hex) => hatId !== undefined,
  ) as Hex[];

  const { adminHatIds } = useAdminOfHats({ hatIds, chainId });

  const isAdminOfAnyHatWithChanges = useMemo(() => {
    const hatsWithChangesIds = _.map(storedData, 'id');

    const hasAdminOverAnyHat = _.some(hatsWithChangesIds, (id: Hex) =>
      _.includes(adminHatIds, id),
    );

    return hasAdminOverAnyHat;
  }, [storedData, adminHatIds]);

  const { writeAsync } = useMulticallManyHats({
    isAdminOfAnyHatWithChanges,
    storedData,
    setStoredData,
    treeToDisplay,
    onchainHats,
    chainId,
    handlePendingTx,
  });

  const handleDeploy = async () => {
    await writeAsync?.();
    // TODO handle result and close drawer
    // if (result) {
    //   setEditMode?.(false);
    //   onCloseTreeDrawer?.();
    // }
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
    posthog.capture('Reset Tree Changes', {
      tree_id: treeId,
      chain_id: chainId,
    });
    resetTree?.();
    closeModal();
  };

  const getDeployTooltipLabel = useMemo(() => {
    if (!storedData?.length) {
      return 'No changes have been made.';
    }
    if (!address) {
      return 'Connect a wallet to deploy. Or export the changes to a file.';
    }
    if (chainId !== currentChain) {
      return `Must be on ${chainsMap(chainId).name} to deploy`;
    }
    if (!isAdminOfAnyHatWithChanges) {
      return 'You must be the admin of at least one hat with changes to deploy';
    }
    return '';
  }, [chainId, currentChain, address, isAdminOfAnyHatWithChanges, storedData]);

  const isDeployDisabled = useMemo(
    () =>
      !editHasUpdates(storedData) ||
      currentChain !== chainId ||
      !isAdminOfAnyHatWithChanges,
    [storedData, currentChain, chainId, isAdminOfAnyHatWithChanges],
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

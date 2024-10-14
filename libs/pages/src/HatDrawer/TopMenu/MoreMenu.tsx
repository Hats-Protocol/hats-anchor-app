'use client';

import {
  Button,
  Divider,
  HStack,
  Icon,
  Link,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { CONFIG, MUTABILITY } from '@hatsprotocol/constants';
import { hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import {
  useHatContractWrite,
  useHatMakeImmutable,
  useHatStatusCheck,
  useWearerDetails,
} from 'hats-hooks';
import { handleExportBranch, isWearingAdminHat } from 'hats-utils';
import { useClipboard, useToast, useWaitForSubgraph } from 'hooks';
import _ from 'lodash';
import posthog from 'posthog-js';
import {
  FaCopy,
  FaDoorOpen,
  FaEllipsisV,
  FaExclamationCircle,
  FaLink,
  FaLock,
  FaPowerOff,
} from 'react-icons/fa';
import { TbChartDots3 } from 'react-icons/tb';
import { idToIp } from 'shared';
import { getDisabledReason, isSameAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

const MoreMenu = () => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    chainId,
    treeToDisplayWithInactiveHats,
    storedData,
    linkedHatIds,
    onchainHats,
  } = useTreeForm();
  const { selectedHat, isClaimable } = useSelectedHat();

  const { address } = useAccount();
  const currentNetworkId = useChainId();
  const toast = useToast();
  const { handlePendingTx } = useOverlay();

  const { data: wearer } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });

  const isAdminUser = isWearingAdminHat(_.map(wearer, 'id'), selectedHat?.id);

  const mutableStatus = selectedHat?.mutable ? MUTABILITY.MUTABLE : 'Immutable';

  const {
    writeAsync: updateImmutability,
    isLoading: isLoadingUpdateImmutability,
  } = useHatMakeImmutable({
    selectedHat,
    onchainHats,
    chainId,
    isAdminUser,
    mutable: selectedHat?.mutable,
    handlePendingTx,
  });

  const txDescription = `${
    selectedHat?.status ? 'Deactivated' : 'Activated'
  } hat ${idToIp(selectedHat?.id)}`;

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const { writeAsync: toggleHat, isLoading: isLoadingToggleHat } =
    useHatContractWrite({
      functionName: 'setHatStatus',
      args: [selectedHat?.id, !selectedHat?.status],
      chainId,
      txDescription,
      successToastData: {
        title: 'Hat Status Updated!',
        description: txDescription,
      },
      queryKeys: [['hatDetails'], ['treeDetails']],
      handlePendingTx,
      waitForSubgraph,
    });

  const {
    writeAsync: checkHatStatus,
    isLoading: isLoadingCheckHatStatus,
    toggleIsContract,
  } = useHatStatusCheck({
    chainId,
    hatData: selectedHat,
    handlePendingTx,
  });

  const { onCopy: copyHatId } = useClipboard(selectedHat?.id || '', {
    toastData: {
      title: 'Copied Hat Hex ID',
      description: `Copied ${selectedHat?.id?.slice(0, 25)}`,
    },
  });
  const { onCopy: copyHatDecimalId } = useClipboard(
    selectedHat?.id ? hatIdHexToDecimal(selectedHat.id).toString() : '',
    {
      toastData: {
        title: 'Copied Hat Decimal ID',
        description: selectedHat?.id
          ? `Copied ${hatIdHexToDecimal(selectedHat.id)
              .toString()
              .slice(0, 25)}...`
          : '',
      },
    },
  );
  const { onCopy: copyContractAddress } = useClipboard(CONFIG.hatsAddress, {
    toastData: { title: 'Successfully copied contract address to clipboard' },
  });

  const handleExport = () =>
    handleExportBranch({
      targetHatId: selectedHat?.id,
      treeToDisplayWithInactiveHats,
      linkedHatIds,
      storedData,
      chainId,
      toast,
    });

  const enableLinking = posthog.isFeatureEnabled('linking');

  if (!selectedHat) return null;

  return (
    <>
      <Menu isLazy>
        <MenuButton as={Button} variant='outline'>
          <HStack>
            <Icon as={FaEllipsisV} />
            <Text>More</Text>
          </HStack>
        </MenuButton>
        <MenuList gap={5}>
          {/* OFF-CHAIN ACTIONS */}
          <MenuGroup title='Off-chain Actions'>
            <MenuItem icon={<TbChartDots3 />} onClick={handleExport}>
              Export branch {idToIp(selectedHat?.id)}
            </MenuItem>

            <MenuItem icon={<FaCopy />} onClick={copyHatId}>
              Copy Hat Hex ID
            </MenuItem>

            <MenuItem icon={<FaCopy />} onClick={copyHatDecimalId}>
              Copy Hat Decimal ID
            </MenuItem>

            <MenuItem onClick={copyContractAddress} icon={<FaCopy />}>
              Copy Hats Contract
            </MenuItem>
          </MenuGroup>

          <Divider />

          {/* ONCHAIN ACTIONS */}
          <MenuGroup title='On-chain Actions'>
            <Stack spacing={0}>
              {address && isClaimable?.by && !isClaimable?.for && (
                <Tooltip
                  label={getDisabledReason({
                    isNotConnected: !address,
                    isOnWrongNetwork: chainId !== currentNetworkId,
                  })}
                >
                  <MenuItem
                    onClick={() => setModals?.({ checkEligibility: true })}
                    icon={<Icon as={FaExclamationCircle} />}
                    isDisabled={chainId !== currentNetworkId}
                  >
                    Check Eligibility
                  </MenuItem>
                </Tooltip>
              )}

              <Tooltip
                label={
                  !toggleIsContract
                    ? 'The toggle is "humanistic"'
                    : chainId !== currentNetworkId
                      ? "You can't test status of a hat on a different chain"
                      : ''
                }
                shouldWrapChildren
              >
                <MenuItem
                  onClick={() => checkHatStatus?.()}
                  isDisabled={
                    isLoadingCheckHatStatus ||
                    !checkHatStatus ||
                    !toggleIsContract ||
                    chainId !== currentNetworkId
                  }
                  icon={<FaDoorOpen />}
                >
                  Test hat status
                </MenuItem>
              </Tooltip>

              {address && enableLinking && (
                <Tooltip
                  label={getDisabledReason({
                    isNotConnected: !address,
                    isOnWrongNetwork: chainId !== currentNetworkId,
                  })}
                  shouldWrapChildren
                >
                  <MenuItem
                    onClick={() => setModals?.({ requestLink: true })}
                    isDisabled={chainId !== currentNetworkId}
                    icon={<FaLink />}
                  >
                    Request to link tree here
                  </MenuItem>
                </Tooltip>
              )}

              {isAdminUser && isSameAddress(selectedHat?.toggle, address) && (
                <Tooltip
                  label={getDisabledReason({
                    isNotConnected: !address,
                    isOnWrongNetwork: chainId !== currentNetworkId,
                  })}
                  shouldWrapChildren
                >
                  <MenuItem
                    onClick={toggleHat}
                    isDisabled={
                      !isSameAddress(selectedHat?.toggle, address) ||
                      isLoadingToggleHat ||
                      chainId !== currentNetworkId ||
                      !toggleHat
                    }
                    icon={<FaPowerOff />}
                  >
                    {selectedHat?.status ? 'Deactivate' : 'Activate'} hat
                  </MenuItem>
                </Tooltip>
              )}

              {isAdminUser && (
                <Tooltip
                  label={getDisabledReason({
                    isNotConnected: !address,
                    isOnWrongNetwork: chainId !== currentNetworkId,
                  })}
                  shouldWrapChildren
                >
                  <MenuItem
                    onClick={onOpen}
                    isDisabled={
                      mutableStatus === MUTABILITY.IMMUTABLE ||
                      !updateImmutability ||
                      chainId !== currentNetworkId ||
                      isLoadingUpdateImmutability
                    }
                    icon={<FaLock />}
                  >
                    Make immutable
                  </MenuItem>
                </Tooltip>
              )}
            </Stack>
          </MenuGroup>

          <Divider />

          {/* REPORT */}
          <MenuItem as={Link} href='mailto:support@hatsprotocol.xyz' gap={2}>
            <FaExclamationCircle />
            Report this hat
          </MenuItem>
        </MenuList>
      </Menu>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Make Hat #{idToIp(selectedHat?.id)} Immutable
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to make this hat immutable? This is not
              reversible.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme='red'
              mr={3}
              onClick={() => {
                updateImmutability?.();
                onClose();
              }}
              isLoading={isLoadingUpdateImmutability}
            >
              Confirm
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MoreMenu;

import {
  Button,
  Divider,
  HStack,
  Icon,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  useClipboard,
  useDisclosure,
} from '@chakra-ui/react';
import { CONFIG, MUTABILITY } from '@hatsprotocol/constants';
import { useOverlay, useTreeForm } from 'contexts';
import {
  useHatContractWrite,
  useHatMakeImmutable,
  useHatStatusCheck,
  useWearerDetails,
} from 'hats-hooks';
import { handleExportBranch, isWearingAdminHat } from 'hats-utils';
import { useToast } from 'hooks';
import _ from 'lodash';
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
import { idToIp, toTreeId } from 'shared';
import { isSameAddress } from 'utils';
import { useAccount, useChainId } from 'wagmi';

const MoreMenu = () => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    chainId,
    selectedHat,
    treeToDisplayWithInactiveHats,
    storedData,
    linkedHatIds,
    onchainHats,
  } = useTreeForm();
  const { address } = useAccount();
  const currentNetworkId = useChainId();
  const toast = useToast();
  const { handlePendingTx } = useOverlay();

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
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

  const { writeAsync: toggleHat, isLoading: isLoadingToggleHat } =
    useHatContractWrite({
      functionName: 'setHatStatus',
      args: [selectedHat?.id, !selectedHat?.status],
      chainId,
      txDescription,
      onSuccessToastData: {
        title: 'Hat Status Updated!',
        description: txDescription,
      },
      queryKeys: [
        ['hatDetails', { id: selectedHat?.id, chainId }],
        ['treeDetails', toTreeId(selectedHat?.id)],
      ],
      enabled:
        Boolean(selectedHat) &&
        isSameAddress(address, selectedHat?.toggle) &&
        chainId === currentNetworkId,
    });

  const {
    writeAsync: checkHatStatus,
    isLoading: isLoadingCheckHatStatus,
    toggleIsContract,
  } = useHatStatusCheck({
    chainId,
    hatData: selectedHat,
  });

  const { onCopy: copyHatId } = useClipboard(selectedHat?.id);
  const { onCopy: copyContractAddress } = useClipboard(CONFIG.hatsAddress);

  const handleExport = () =>
    handleExportBranch({
      targetHatId: selectedHat?.id,
      treeToDisplayWithInactiveHats,
      linkedHatIds,
      storedData,
      chainId,
      toast,
    });

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
          <MenuItem onClick={handleExport}>
            <HStack>
              <TbChartDots3 />
              <Text>Export branch {idToIp(selectedHat?.id)}</Text>
            </HStack>
          </MenuItem>
          <MenuItem
            gap={2}
            onClick={() => {
              copyHatId();
              toast.info({
                title: 'Successfully copied hat ID to clipboard',
              });
            }}
          >
            <FaCopy />
            Copy hat ID
          </MenuItem>
          <MenuItem
            gap={2}
            onClick={() => {
              copyContractAddress();
              toast.info({
                title: 'Successfully copied contract address to clipboard',
              });
            }}
          >
            <FaCopy />
            Copy contract ID
          </MenuItem>
          <Divider />
          <Tooltip
            label={!toggleIsContract ? 'The toggle is "humanistic"' : ''}
            shouldWrapChildren
          >
            <MenuItem
              gap={2}
              onClick={() => checkHatStatus?.()}
              isDisabled={
                isLoadingCheckHatStatus || !checkHatStatus || !toggleIsContract
              }
            >
              <Tooltip
                label={
                  chainId !== currentNetworkId
                    ? "You can't test status of a hat on a different chain"
                    : ''
                }
                shouldWrapChildren
              >
                <HStack>
                  <FaDoorOpen />
                  <Text>Test hat status</Text>
                </HStack>
              </Tooltip>
            </MenuItem>
          </Tooltip>
          {address && (
            <MenuItem
              gap={2}
              onClick={() => setModals?.({ requestLink: true })}
              isDisabled={chainId !== currentNetworkId}
            >
              <Tooltip
                label={
                  chainId !== currentNetworkId
                    ? "You can't request to link a hat on a different chain"
                    : ''
                }
                shouldWrapChildren
              >
                <HStack>
                  <FaLink />

                  <Text>Request to link tree here</Text>
                </HStack>
              </Tooltip>
            </MenuItem>
          )}
          {isAdminUser && isSameAddress(selectedHat?.toggle, address) && (
            <MenuItem
              gap={2}
              onClick={() => toggleHat?.()}
              isDisabled={
                !isSameAddress(selectedHat?.toggle, address) ||
                isLoadingToggleHat ||
                !toggleHat
              }
            >
              <Tooltip
                label={
                  !isSameAddress(selectedHat?.toggle, address)
                    ? "Your address doesn't match the hat's toggle address"
                    : ''
                }
                shouldWrapChildren
              >
                <HStack>
                  <FaPowerOff />
                  <Text>
                    {selectedHat?.status ? 'Deactivate' : 'Activate'} hat
                  </Text>
                </HStack>
              </Tooltip>
            </MenuItem>
          )}
          {isAdminUser && (
            <MenuItem
              gap={2}
              onClick={onOpen}
              isDisabled={
                mutableStatus === MUTABILITY.IMMUTABLE ||
                !updateImmutability ||
                isLoadingUpdateImmutability
              }
            >
              <Tooltip
                label={
                  !updateImmutability
                    ? "You don't have permission to make this hat immutable"
                    : ''
                }
                shouldWrapChildren
              >
                <HStack>
                  <FaLock />
                  <Text>Make immutable</Text>
                </HStack>
              </Tooltip>
            </MenuItem>
          )}
          <Divider />
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
              colorScheme='blue'
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

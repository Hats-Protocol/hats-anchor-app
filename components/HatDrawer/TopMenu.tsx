import {
  Button,
  Flex,
  HStack,
  Icon,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { lazy, Suspense } from 'react';
import { BsArrowLeft } from 'react-icons/bs';
import {
  FaCopy,
  FaDoorOpen,
  FaEllipsisV,
  FaExclamationCircle,
  FaLink,
  FaLock,
  FaPowerOff,
} from 'react-icons/fa';
import { FiSave } from 'react-icons/fi';
import { useAccount, useChainId } from 'wagmi';

import Suspender from '@/components/atoms/Suspender';
import CONFIG, { MUTABILITY } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useHatMakeImmutable from '@/hooks/useHatMakeImmutable';
import useHatStatusCheck from '@/hooks/useHatStatusCheck';
import useToast from '@/hooks/useToast';
import useWearerDetails from '@/hooks/useWearerDetails';
import { isSameAddress } from '@/lib/general';
import { decimalId, isAdmin, isTopHat, toTreeId } from '@/lib/hats';
import { IHat } from '@/types';

const Modal = lazy(() => import('@/components/atoms/Modal'));
const HatLinkRequestCreateForm = lazy(
  () => import('@/forms/HatLinkRequestCreateForm'),
);

const TopMenu = ({ onSave, returnToList, isLoading }: TopMenuProps) => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { chainId, editMode, selectedHat } = useTreeForm();
  const { address } = useAccount();
  const currentNetworkId = useChainId();
  const toast = useToast();

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });

  const isAdminUser = isAdmin(_.map(wearer, 'id'), selectedHat?.id);

  const wearerTopHats = _.map(
    _.filter(
      wearer,
      (hat: IHat) => isTopHat(hat) && hat?.id !== selectedHat?.id,
    ),
    'id',
  );
  const mutableStatus = selectedHat?.mutable ? MUTABILITY.MUTABLE : 'Immutable';

  const {
    writeAsync: updateImmutability,
    isLoading: isLoadingUpdateImmutability,
  } = useHatMakeImmutable({
    levelAtLocalTree: selectedHat?.levelAtLocalTree,
    isAdminUser,
    mutable: selectedHat?.mutable,
  });

  const { writeAsync: toggleHat, isLoading: isLoadingToggleHat } =
    useHatContractWrite({
      functionName: 'setHatStatus',
      args: [selectedHat?.id, !selectedHat?.status],
      chainId,
      onSuccessToastData: {
        title: 'Hat Status Updated!',
        description: 'Successfully updated hat',
      },
      queryKeys: [
        ['hatDetails', selectedHat?.id || 'none'],
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

  const { onCopy: copyHatId } = useClipboard(decimalId(selectedHat?.id));
  const { onCopy: copyContractAddress } = useClipboard(CONFIG.hatsAddress);

  const handleReturnToList = () => {
    onSave(false);
    returnToList();
  };

  const handleSave = () => {
    onSave();
  };

  if (!selectedHat) return null;

  return (
    <Flex
      w='100%'
      borderBottom='1px solid'
      borderColor='gray.200'
      h='75px'
      bg='whiteAlpha.900'
      align='center'
      justify={editMode ? 'space-between' : 'flex-end'}
      px={4}
      position='absolute'
      top={0}
      zIndex={16}
    >
      {editMode && (
        <Button onClick={handleReturnToList} variant='outline'>
          <HStack>
            <Icon as={BsArrowLeft} />
            <Text>{hatIdDecimalToIp(BigInt(selectedHat?.id))}</Text>
          </HStack>
        </Button>
      )}

      <HStack spacing={3}>
        {!editMode && (
          <Menu isLazy>
            <MenuButton as={Button} variant='outline'>
              <HStack>
                <Icon as={FaEllipsisV} />
                <Text>More</Text>
              </HStack>
            </MenuButton>
            <MenuList gap={5}>
              {isAdminUser && (
                <MenuItem
                  gap={2}
                  onClick={() => updateImmutability?.()}
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
              {(isAdminUser || isSameAddress(selectedHat?.toggle, address)) && (
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
                        {selectedHat?.status ? 'Deactivate' : 'Activate'} Hat
                      </Text>
                    </HStack>
                  </Tooltip>
                </MenuItem>
              )}
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
              <Tooltip
                label={!toggleIsContract ? 'The toggle is "humanistic"' : ''}
                shouldWrapChildren
              >
                <MenuItem
                  gap={2}
                  onClick={() => checkHatStatus?.()}
                  isDisabled={
                    isLoadingCheckHatStatus ||
                    !checkHatStatus ||
                    !toggleIsContract
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
                      <Text>Test Status</Text>
                    </HStack>
                  </Tooltip>
                </MenuItem>
              </Tooltip>
              <MenuItem
                gap={2}
                onClick={() => {
                  copyHatId();
                  toast.info({
                    title: 'Successfully copied Hat ID to clipboard',
                  });
                }}
              >
                <FaCopy />
                Copy Hat ID
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
                Copy Contract ID
              </MenuItem>
              <MenuItem
                as={Link}
                href='mailto:support@hatsprotocol.xyz'
                gap={2}
              >
                <FaExclamationCircle />
                Report this Hat
              </MenuItem>
            </MenuList>
          </Menu>
        )}

        {editMode && (
          <Button
            leftIcon={<FiSave />}
            colorScheme='twitter'
            variant='solid'
            onClick={handleSave}
            isLoading={isLoading}
          >
            Save
          </Button>
        )}
      </HStack>

      <Suspense fallback={<Suspender />}>
        <Modal
          name='requestLink'
          title='Request to Link'
          localOverlay={localOverlay}
        >
          <HatLinkRequestCreateForm
            newAdmin={selectedHat.id}
            wearerTopHats={_.filter(
              wearerTopHats,
              (hat) => hat !== selectedHat.admin?.id,
            )}
          />
        </Modal>
      </Suspense>
    </Flex>
  );
};

export default TopMenu;

interface TopMenuProps {
  onSave: (v?: boolean) => void;
  returnToList: () => void;
  isLoading: boolean;
}

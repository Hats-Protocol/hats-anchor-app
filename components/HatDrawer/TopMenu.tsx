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
import _ from 'lodash';
import { lazy, Suspense } from 'react';
import {
  FaCopy,
  FaDoorOpen,
  FaEdit,
  FaEllipsisV,
  FaExclamationCircle,
  FaLink,
  FaLock,
  FaPowerOff,
} from 'react-icons/fa';
import { FiChevronsRight } from 'react-icons/fi';
import { useAccount, useChainId } from 'wagmi';

import Suspender from '@/components/atoms/Suspender';
import CONFIG, { MUTABILITY } from '@/constants';
import { IOverlayContext } from '@/contexts/OverlayContext';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useHatMakeImmutable from '@/hooks/useHatMakeImmutable';
import useHatStatusCheck from '@/hooks/useHatStatusCheck';
import useToast from '@/hooks/useToast';
import { isSameAddress } from '@/lib/general';
import { decimalId, isTopHatOrMutable, toTreeId } from '@/lib/hats';
import { IHat } from '@/types';

const Modal = lazy(() => import('@/components/atoms/Modal'));
const HatLinkRequestCreateForm = lazy(
  () => import('@/forms/HatLinkRequestCreateForm'),
);

const TopMenu = ({
  chainId,
  onClose,
  mutableStatus,
  hatData,
  editMode,
  setEditMode,
  isCurrentWearer,
  localOverlay,
  wearerTopHats,
  setSelectedHatId,
  isAdminUser,
}: TopMenuProps) => {
  const { setModals } = localOverlay;
  const { address } = useAccount();
  const currentNetworkId = useChainId();
  const toast = useToast();

  const {
    writeAsync: updateImmutability,
    isLoading: isLoadingUpdateImmutability,
  } = useHatMakeImmutable({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId: hatData.id,
    levelAtLocalTree: hatData.levelAtLocalTree,
    isAdminUser,
    mutable: hatData.mutable,
  });

  const { writeAsync: toggleHat, isLoading: isLoadingToggleHat } =
    useHatContractWrite({
      functionName: 'setHatStatus',
      args: [hatData.id, !hatData.status],
      chainId,
      onSuccessToastData: {
        title: 'Hat Status Updated!',
        description: 'Successfully updated hat',
      },
      queryKeys: [
        ['hatDetails', hatData.id],
        ['treeDetails', toTreeId(hatData.id)],
      ],
      enabled:
        Boolean(hatData) &&
        isSameAddress(address, hatData.toggle) &&
        chainId === currentNetworkId,
    });

  const {
    writeAsync: checkHatStatus,
    isLoading: isLoadingCheckHatStatus,
    toggleIsContract,
  } = useHatStatusCheck({
    chainId,
    hatData,
  });

  const { onCopy: copyHatId } = useClipboard(decimalId(hatData.id));
  const { onCopy: copyContractAddress } = useClipboard(CONFIG.hatsAddress);

  if (!hatData) return null;

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
        onClick={() => {
          onClose();
          setSelectedHatId(undefined);
        }}
      >
        <HStack>
          <Icon as={FiChevronsRight} />
          <Text>Collapse</Text>
        </HStack>
      </Button>
      <HStack>
        {isAdminUser && chainId === currentNetworkId && (
          <Tooltip
            label={!isTopHatOrMutable(hatData) ? 'The hat is not mutable' : ''}
            shouldWrapChildren
          >
            <Button
              variant='outline'
              background='cyan.100'
              color='cyan.700'
              borderColor='cyan.700'
              onClick={() => setEditMode(!editMode)}
              isDisabled={!isTopHatOrMutable(hatData)}
            >
              <HStack>
                <Icon as={FaEdit} />
                <Text>{editMode ? 'Exit' : 'Edit'}</Text>
              </HStack>
            </Button>
          </Tooltip>
        )}
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
            {(isAdminUser || isSameAddress(hatData?.toggle, address)) && (
              <MenuItem
                gap={2}
                onClick={() => toggleHat?.()}
                isDisabled={
                  !isSameAddress(hatData?.toggle, address) ||
                  isLoadingToggleHat ||
                  !toggleHat
                }
              >
                <Tooltip
                  label={
                    !isSameAddress(hatData?.toggle, address)
                      ? "Your address doesn't match the hat's toggle address"
                      : ''
                  }
                  shouldWrapChildren
                >
                  <HStack>
                    <FaPowerOff />
                    <Text>
                      {hatData?.status ? 'Deactivate' : 'Activate'} Hat
                    </Text>
                  </HStack>
                </Tooltip>
              </MenuItem>
            )}
            {(isAdminUser || isCurrentWearer) && (
              <MenuItem
                gap={2}
                onClick={() => setModals?.({ createHat: true })}
                isDisabled={chainId !== currentNetworkId}
              >
                <Tooltip
                  label={
                    chainId !== currentNetworkId
                      ? "You can't create a child hat on a different chain"
                      : ''
                  }
                  shouldWrapChildren
                >
                  <HStack>
                    <FaDoorOpen />
                    <Text>Add Child Hat</Text>
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
            <MenuItem as={Link} href='mailto:support@hatsprotocol.xyz' gap={2}>
              <FaExclamationCircle />
              Report this Hat
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>

      <Suspense fallback={<Suspender />}>
        <Modal
          name='requestLink'
          title='Request to Link'
          localOverlay={localOverlay}
        >
          <HatLinkRequestCreateForm
            newAdmin={hatData.id}
            wearerTopHats={_.filter(
              wearerTopHats,
              (hat) => hat !== hatData.admin?.id,
            )}
            chainId={chainId}
          />
        </Modal>
      </Suspense>
    </Flex>
  );
};

export default TopMenu;

interface TopMenuProps {
  mutableStatus: string;
  hatData: IHat;
  chainId: number;
  onClose: () => void;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  isAdminUser: boolean;
  isCurrentWearer: boolean;
  localOverlay: IOverlayContext;
  wearerTopHats: string[];
  setSelectedHatId: (hatId?: string) => void;
}

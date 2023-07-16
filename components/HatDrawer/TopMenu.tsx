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

import Modal from '@/components/Modal';
import CONFIG, { MUTABILITY, STATUS } from '@/constants';
import { IOverlayContext } from '@/contexts/OverlayContext';
import HatCreateForm from '@/forms/HatCreateForm';
import HatLinkRequestCreateForm from '@/forms/HatLinkRequestCreateForm';
import useHatMakeImmutable from '@/hooks/useHatMakeImmutable';
import useHatStatusCheck from '@/hooks/useHatStatusCheck';
import useHatStatusUpdate from '@/hooks/useHatStatusUpdate';
import useToast from '@/hooks/useToast';
import { decimalId, isTopHat } from '@/lib/hats';
import { IHat } from '@/types';

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
  isUserAdminOfAnyParent,
  currentNetworkId,
}: TopMenuProps) => {
  const { setModals } = localOverlay;
  const { address } = useAccount();
  const userChainId = useChainId();
  const toast = useToast();

  const {
    writeAsync: updateImmutability,
    isLoading: isLoadingUpdateImmutability,
  } = useHatMakeImmutable({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId: hatData.id,
    levelAtLocalTree: hatData.levelAtLocalTree,
  });

  const { writeAsync: toggleHat, isLoading: isLoadingToggleHat } =
    useHatStatusUpdate({
      hatsAddress: CONFIG.hatsAddress,
      chainId,
      hatData,
      status: STATUS.INACTIVE,
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
        {isAdminUser && chainId === userChainId && (
          <Tooltip
            label={
              mutableStatus !== MUTABILITY.MUTABLE && !isTopHat(hatData)
                ? 'The hat is not mutable'
                : ''
            }
            shouldWrapChildren
          >
            <Button
              variant='outline'
              background='cyan.100'
              color='cyan.700'
              borderColor='cyan.700'
              onClick={() => setEditMode(!editMode)}
              isDisabled={
                mutableStatus !== MUTABILITY.MUTABLE && !isTopHat(hatData)
              }
            >
              <HStack>
                <Icon as={FaEdit} />
                <Text>{editMode ? 'Exit' : 'Edit'}</Text>
              </HStack>
            </Button>
          </Tooltip>
        )}
        <Menu>
          <MenuButton as={Button} variant='outline'>
            <HStack>
              <Icon as={FaEllipsisV} />
              <Text>More</Text>
            </HStack>
          </MenuButton>
          <MenuList gap={5}>
            {(isAdminUser || isUserAdminOfAnyParent) && (
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
            {(isAdminUser || hatData?.toggle === address?.toLowerCase()) && (
              <MenuItem
                gap={2}
                onClick={() => toggleHat?.()}
                isDisabled={
                  address?.toLowerCase() !== hatData?.toggle ||
                  isLoadingToggleHat ||
                  !toggleHat
                }
              >
                <Tooltip
                  label={
                    address?.toLowerCase() !== hatData?.toggle
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

      <Modal name='createHat' title='Create Hat' localOverlay={localOverlay}>
        <HatCreateForm
          defaultAdmin={hatData.prettyId}
          treeId={hatData.tree.id}
        />
      </Modal>

      <Modal
        name='requestLink'
        title='Request to Link'
        localOverlay={localOverlay}
      >
        <HatLinkRequestCreateForm
          newAdmin={hatData.prettyId}
          wearerTopHats={_.filter(
            wearerTopHats,
            (hat) => hat !== hatData.admin?.prettyId,
          )}
          chainId={chainId}
        />
      </Modal>
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
  isUserAdminOfAnyParent: boolean;
  currentNetworkId?: number;
}

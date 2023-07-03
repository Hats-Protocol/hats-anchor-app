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
} from '@chakra-ui/react';
import {
  FaCopy,
  FaDoorOpen,
  FaEdit,
  FaEllipsisV,
  FaExclamationCircle,
  FaLock,
  FaPowerOff,
} from 'react-icons/fa';
import { FiChevronsRight } from 'react-icons/fi';

import Modal from '@/components/Modal';
import CONFIG from '@/constants';
import HatCreateForm from '@/forms/HatCreateForm';
import useHatCheckStatus from '@/hooks/useHatCheckStatus';
import useHatMakeImmutable from '@/hooks/useHatMakeImmutable';
import useHatStatusUpdate from '@/hooks/useHatStatusUpdate';
import useToast from '@/hooks/useToast';
import { isTopHat } from '@/lib/hats';
import { useAccount } from 'wagmi';

const TopMenu = ({
  chainId,
  onClose,
  mutableStatus,
  hatData,
  editMode,
  setEditMode,
  isAdminUser,
  isCurrentWearer,
  localOverlay,
}: TopMenuProps) => {
  const { setModals } = localOverlay;
  const { address } = useAccount();
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
  const { writeAsync: deactivateHat, isLoading: isLoadingDeactivateHat } =
    useHatStatusUpdate({
      hatsAddress: CONFIG.hatsAddress,
      chainId,
      hatId: hatData.id,
      status: 'Inactive',
    });

  const {
    writeAsync: checkHatStatus,
    isLoading: isLoadingCheckHatStatus,
    prepareError,
  } = useHatCheckStatus({
    chainId,
    hatId: hatData.id,
  });

  function containsNotHatsToggleErrorMessage(message?: string) {
    if (!message) return false;
    const regex = /Error: NotHatsToggle()/;
    return regex.test(message);
  }

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
      <Button variant='outline' onClick={onClose}>
        <HStack>
          <Icon as={FiChevronsRight} />
          <Text>Collapse</Text>
        </HStack>
      </Button>
      <HStack>
        {isAdminUser && (
          <Tooltip
            label={
              !(mutableStatus === 'Mutable' && !isTopHat(hatData))
                ? 'The hat is not mutable or a top hat.'
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
              isDisabled={!(mutableStatus === 'Mutable' || isTopHat(hatData))}
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
            {isAdminUser && (
              <>
                <MenuItem
                  gap={2}
                  onClick={() => updateImmutability?.()}
                  isDisabled={
                    mutableStatus === 'Immutable' ||
                    !updateImmutability ||
                    isLoadingUpdateImmutability
                  }
                >
                  <FaLock />
                  Make immutable
                </MenuItem>
                <MenuItem
                  gap={2}
                  onClick={() => deactivateHat?.()}
                  isDisabled={
                    address?.toLowerCase() !== hatData?.toggle ||
                    isLoadingDeactivateHat ||
                    !hatData?.status ||
                    !deactivateHat
                  }
                >
                  <Tooltip
                    label={
                      address?.toLowerCase() !== hatData?.toggle
                        ? "You don't have the permission to toggle this hat"
                        : ''
                    }
                    shouldWrapChildren
                  >
                    <HStack>
                      <FaPowerOff />
                      <Text>Deactivate Hat</Text>
                    </HStack>
                  </Tooltip>
                </MenuItem>
              </>
            )}
            {isAdminUser ||
              (isCurrentWearer && (
                <MenuItem
                  gap={2}
                  onClick={() => setModals?.({ createHat: true })}
                >
                  <HStack>
                    <FaDoorOpen />
                    <Text>Add Child Hat</Text>
                  </HStack>
                </MenuItem>
              ))}
            <Tooltip
              label={
                containsNotHatsToggleErrorMessage(prepareError?.message)
                  ? 'The toggle is "humanistic"'
                  : ''
              }
              shouldWrapChildren
            >
              <MenuItem
                gap={2}
                onClick={() => checkHatStatus?.()}
                isDisabled={isLoadingCheckHatStatus || !checkHatStatus}
              >
                <HStack>
                  <FaDoorOpen />
                  <Text>Test Status</Text>
                </HStack>
              </MenuItem>
            </Tooltip>
            <MenuItem
              gap={2}
              onClick={() => {
                navigator.clipboard.writeText(hatData?.id);
                toast.info({
                  title: 'Successfully copied Hat id to clipboard',
                });
              }}
            >
              <FaCopy />
              Copy Hat ID
            </MenuItem>
            <MenuItem
              gap={2}
              onClick={() => {
                navigator.clipboard.writeText(CONFIG.hatsAddress);
                toast.info({
                  title: 'Successfully copied contract id to clipboard',
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
          treeId={hatData.treeId}
        />
      </Modal>
    </Flex>
  );
};

export default TopMenu;

interface TopMenuProps {
  mutableStatus: string;
  hatData: any;
  chainId: number;
  onClose: () => void;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  isAdminUser: boolean;
  isCurrentWearer: boolean;
  localOverlay: any;
}

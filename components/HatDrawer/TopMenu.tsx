/* eslint-disable no-shadow */
import React from 'react';
import {
  Flex,
  HStack,
  Icon,
  Button,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Link,
  Tooltip,
} from '@chakra-ui/react';
import { FiChevronsRight } from 'react-icons/fi';
import {
  FaCopy,
  FaDoorOpen,
  FaEdit,
  FaEllipsisV,
  FaExclamationCircle,
  FaLock,
  FaPowerOff,
} from 'react-icons/fa';

import CONFIG from '@/constants';
import useHatMakeImmutable from '@/hooks/useHatMakeImmutable';
import useToast from '@/hooks/useToast';
import useHatStatusUpdate from '@/hooks/useHatStatusUpdate';
import { useAccount } from 'wagmi';
import useHatCheckStatus from '@/hooks/useHatCheckStatus';

const TopMenu = ({
  chainId,
  onClose,
  mutableStatus,
  hatData,
  editMode,
  setEditMode,
}: TopMenuProps) => {
  const { address } = useAccount();
  const toast = useToast();

  const {
    writeAsync: updateImmutability,
    isLoading: isLoadingUpdateImmutability,
  } = useHatMakeImmutable({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatData,
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
        <Button
          variant='outline'
          background='cyan.100'
          color='cyan.700'
          borderColor='cyan.700'
          onClick={() => setEditMode(!editMode)}
        >
          <HStack>
            <Icon as={FaEdit} />
            <Text>{editMode ? 'Save' : 'Edit'}</Text>
          </HStack>
        </Button>
        <Menu>
          <MenuButton as={Button} variant='outline'>
            <HStack>
              <Icon as={FaEllipsisV} />
              <Text>More</Text>
            </HStack>
          </MenuButton>
          <MenuList gap={5}>
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
            <Tooltip
              label={
                containsNotHatsToggleErrorMessage(prepareError?.message)
                  ? 'The toggle is not "humanistic"'
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
              Report this hat
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
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
}

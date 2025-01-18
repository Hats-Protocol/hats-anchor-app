'use client';

import { Button, Flex, HStack, Icon, Text, Tooltip } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { Modal, useHatForm, useSelectedHat, useTreeForm } from 'contexts';
import { HatLinkRequestCreateForm } from 'forms';
import { useWearerDetails } from 'hats-hooks';
import { isTopHat } from 'hats-utils';
import { useMediaStyles } from 'hooks';
import { filter, find, isEmpty, keys, map, omit } from 'lodash';
import { MainAction } from 'organisms';
import posthog from 'posthog-js';
import { BsArrowLeft, BsXSquare } from 'react-icons/bs';
import { FiSave } from 'react-icons/fi';
import { AppHat } from 'types';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import MoreMenu from './MoreMenu';

// const HatLinkRequestCreateForm = dynamic(
//   () => import('../../../forms'),
// );

const TopMenu = ({ returnToList }: TopMenuProps) => {
  const { chainId, editMode, onchainHats, storedData, treeToDisplay, onCloseHatDrawer } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { handleRemoveHat, handleClearChanges, handleSave: onSave, isLoading: hatFormLoading } = useHatForm();
  const { address } = useAccount();
  const { isMobile } = useMediaStyles();

  const { data: wearer } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
    editMode,
  });

  const wearerTopHats = map(
    filter(wearer, (hat: AppHat) => isTopHat(hat) && hat?.id !== selectedHat?.id),
    'id',
  );

  const onchainHat = find(onchainHats, { id: selectedHat?.id });
  const hatHasChanges = !isEmpty(keys(omit(find(storedData, { id: selectedHat?.id }), 'id')));

  const draftWithChildren = !onchainHat && !isEmpty(filter(treeToDisplay, { parentId: selectedHat?.id }));

  if (!selectedHat || isMobile) return null;

  const closeHatDrawer = () => {
    posthog.capture('Closed Hat Drawer', {
      chain_id: chainId,
      hat_id: selectedHat?.id,
      edit_mode: false,
    });
    onCloseHatDrawer?.();
  };

  const handleReturnToList = () => {
    posthog.capture('Closed Hat Drawer', {
      chain_id: chainId,
      hat_id: selectedHat.id,
      edit_mode: true,
      has_changes: hatHasChanges,
    });
    onSave(false);
    returnToList?.();
  };

  const handleSave = () => {
    onSave();
  };

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
      top={0}
      zIndex={16}
    >
      {editMode ? (
        <Tooltip label='Save and return to list'>
          <Button onClick={handleReturnToList} variant='outline' isLoading={hatFormLoading}>
            <HStack>
              <Icon as={BsArrowLeft} />
              <Text>{hatIdDecimalToIp(BigInt(selectedHat?.id))}</Text>
            </HStack>
          </Button>
        </Tooltip>
      ) : (
        <Button
          onClick={closeHatDrawer}
          leftIcon={<BsXSquare />}
          variant='outline'
          aria-label='Close'
          marginRight='auto'
        >
          Close
        </Button>
      )}

      <HStack spacing={3} justifyContent='flex-end'>
        {!editMode ? (
          <HStack spacing={3} w='full' justifyContent='flex-end'>
            <MainAction />
            <MoreMenu />
          </HStack>
        ) : (
          <HStack>
            {hatHasChanges &&
              (onchainHat ? (
                <Button onClick={handleClearChanges} variant='outline' colorScheme='red.500'>
                  Clear changes
                </Button>
              ) : (
                <Tooltip label={draftWithChildren && "Can't delete draft hats with children"} hasArrow>
                  <Button
                    onClick={handleRemoveHat}
                    variant='outline'
                    colorScheme='red.500'
                    isDisabled={draftWithChildren}
                  >
                    Delete Hat
                  </Button>
                </Tooltip>
              ))}
            <Button
              leftIcon={<FiSave />}
              colorScheme='twitter'
              variant='solid'
              onClick={handleSave}
              isLoading={hatFormLoading}
            >
              Save
            </Button>
          </HStack>
        )}
      </HStack>

      <Modal name='requestLink' title='Request to Link'>
        <HatLinkRequestCreateForm
          newAdmin={selectedHat.id}
          wearerTopHats={filter(wearerTopHats, (hat: string | undefined) => hat !== selectedHat.admin?.id) as Hex[]}
        />
      </Modal>
    </Flex>
  );
};

export default TopMenu;

interface TopMenuProps {
  // onSave: (v?: boolean) => void;
  // handleRemoveHat: () => void;
  // handleClearChanges: () => void;
  returnToList: (() => void) | undefined;
  // isLoading: boolean;
}

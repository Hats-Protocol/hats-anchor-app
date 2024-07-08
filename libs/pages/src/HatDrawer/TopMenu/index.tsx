'use client';

import { Button, Flex, HStack, Icon, Text, Tooltip } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useHatForm, useSelectedHat, useTreeForm } from 'contexts';
import { HatLinkRequestCreateForm } from 'forms';
import { useWearerDetails } from 'hats-hooks';
import { isTopHat } from 'hats-utils';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import { BsArrowLeft, BsXSquare } from 'react-icons/bs';
import { FiSave } from 'react-icons/fi';
import { AppHat } from 'types';
import { useAccount } from 'wagmi';

import MoreMenu from './MoreMenu';

const Modal = dynamic(() => import('ui').then((mod) => mod.Modal));
const MainAction = dynamic(() => import('ui').then((mod) => mod.MainAction));

// const HatLinkRequestCreateForm = dynamic(
//   () => import('../../../forms'),
//   { loading: () => <Suspender /> },
// );

const TopMenu = ({ returnToList }: TopMenuProps) => {
  const {
    chainId,
    editMode,
    onchainHats,
    storedData,
    treeToDisplay,
    onCloseHatDrawer,
  } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const {
    handleRemoveHat,
    handleClearChanges,
    handleSave: onSave,
    formLoading,
  } = useHatForm();
  const { address } = useAccount();
  const { isMobile } = useMediaStyles();

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
    editMode,
  });

  const wearerTopHats = _.map(
    _.filter(
      wearer,
      (hat: AppHat) => isTopHat(hat) && hat?.id !== selectedHat?.id,
    ),
    'id',
  );

  const onchainHat = _.find(onchainHats, { id: selectedHat?.id });
  const hatHasChanges = !_.isEmpty(
    _.keys(_.omit(_.find(storedData, { id: selectedHat?.id }), 'id')),
  );

  const draftWithChildren =
    !onchainHat &&
    !_.isEmpty(_.filter(treeToDisplay, { parentId: selectedHat?.id }));

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
    returnToList();
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
          <Button
            onClick={handleReturnToList}
            variant='outline'
            isLoading={formLoading}
          >
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
                <Button
                  onClick={handleClearChanges}
                  variant='outline'
                  colorScheme='red.500'
                >
                  Clear changes
                </Button>
              ) : (
                <Tooltip
                  label={
                    draftWithChildren && "Can't delete draft hats with children"
                  }
                  hasArrow
                >
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
              isLoading={formLoading}
            >
              Save
            </Button>
          </HStack>
        )}
      </HStack>

      <Modal name='requestLink' title='Request to Link'>
        <HatLinkRequestCreateForm
          newAdmin={selectedHat.id}
          wearerTopHats={_.filter(
            wearerTopHats,
            (hat: string | undefined) => hat !== selectedHat.admin?.id,
          )}
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
  returnToList: () => void;
  // isLoading: boolean;
}

import { Button, Flex, HStack, Icon, Text, Tooltip } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useHatForm, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { HatLinkRequestCreateForm } from 'forms';
import { useWearerDetails } from 'hats-hooks';
import { isTopHat } from 'hats-utils';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsArrowLeft, BsXSquare } from 'react-icons/bs';
import { FiSave } from 'react-icons/fi';
import { AppHat } from 'types';
import { useAccount } from 'wagmi';

import MainAction from '../MainAction';
import MoreMenu from './MoreMenu';

const Modal = dynamic(() => import('ui').then((mod) => mod.Modal));

// const HatLinkRequestCreateForm = dynamic(
//   () => import('../../../forms'),
//   { loading: () => <Suspender /> },
// );

const TopMenu = ({ returnToList }: TopMenuProps) => {
  const localOverlay = useOverlay();
  const { onCloseHatDrawer } = localOverlay;
  const { chainId, editMode, onchainHats, storedData, treeToDisplay } =
    useTreeForm();
  const { selectedHat } = useSelectedHat();

  const {
    isLoading,
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

  const handleReturnToList = () => {
    onSave(false);
    returnToList();
  };

  const handleSave = () => {
    onSave();
  };

  const onchainHat = _.find(onchainHats, { id: selectedHat?.id });
  const hatHasChanges = _.find(storedData, { id: selectedHat?.id });

  const draftWithChildren =
    !onchainHat &&
    !_.isEmpty(_.filter(treeToDisplay, { parentId: selectedHat?.id }));

  if (!selectedHat || isMobile) return null;

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
          onClick={() => {
            onCloseHatDrawer?.();
          }}
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
              isLoading={isLoading || formLoading}
            >
              Save
            </Button>
          </HStack>
        )}
      </HStack>

      <Modal
        name='requestLink'
        title='Request to Link'
        localOverlay={localOverlay}
      >
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

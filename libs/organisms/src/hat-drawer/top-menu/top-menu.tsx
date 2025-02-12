'use client';

import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { Modal, useHatForm, useSelectedHat, useTreeForm } from 'contexts';
import { HatLinkRequestCreateForm } from 'forms';
import { useWearerDetails } from 'hats-hooks';
import { isTopHat } from 'hats-utils';
import { useMediaStyles } from 'hooks';
import { filter, find, isEmpty, keys, map, omit } from 'lodash';
import posthog from 'posthog-js';
import { BsArrowLeft, BsXSquare } from 'react-icons/bs';
import { FiSave } from 'react-icons/fi';
import { AppHat } from 'types';
import { Button, cn, Tooltip } from 'ui';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { MainAction } from '../../main-action';
import { MoreMenu } from './more-menu';

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
    <div
      className={cn(
        'z-[16] flex w-full items-center justify-end border-b border-gray-200 bg-white/90 px-4 py-4',
        editMode ? 'justify-between' : 'justify-end',
      )}
    >
      {editMode ? (
        <Tooltip label='Save and return to list'>
          <Button onClick={handleReturnToList} variant='outline' disabled={hatFormLoading}>
            <div className='flex items-center gap-1'>
              <BsArrowLeft className='size-4' />

              <p>{hatIdDecimalToIp(BigInt(selectedHat?.id))}</p>
            </div>
          </Button>
        </Tooltip>
      ) : (
        <Button onClick={closeHatDrawer} variant='outline' aria-label='Close' className='mr-auto'>
          <BsXSquare className='mr-1 size-4' />
          Close
        </Button>
      )}

      <div className='flex items-center justify-end gap-3'>
        {!editMode ? (
          <div className='flex w-full items-center justify-end gap-3'>
            <MainAction />
            <MoreMenu />
          </div>
        ) : (
          <div className='flex items-center justify-end gap-3'>
            {hatHasChanges &&
              (onchainHat ? (
                <Button onClick={handleClearChanges} variant='outline-red'>
                  Clear changes
                </Button>
              ) : (
                <Tooltip label={draftWithChildren ? "Can't delete draft hats with children" : undefined}>
                  <Button onClick={handleRemoveHat} variant='outline-red' disabled={draftWithChildren}>
                    Delete Hat
                  </Button>
                </Tooltip>
              ))}
            <Button className='bg-cyan-500 hover:bg-cyan-600' onClick={handleSave} disabled={hatFormLoading}>
              <FiSave className='mr-1 size-4' />
              Save
            </Button>
          </div>
        )}
      </div>

      <Modal name='requestLink' title='Request to Link'>
        <HatLinkRequestCreateForm
          newAdmin={selectedHat.id}
          wearerTopHats={filter(wearerTopHats, (hat: string | undefined) => hat !== selectedHat.admin?.id) as Hex[]}
        />
      </Modal>
    </div>
  );
};

interface TopMenuProps {
  // onSave: (v?: boolean) => void;
  // handleRemoveHat: () => void;
  // handleClearChanges: () => void;
  returnToList: (() => void) | undefined;
  // isLoading: boolean;
}

export { TopMenu };

'use client';

import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { Modal, useOverlay, useTreeForm } from 'contexts';
import { formatDistanceToNow } from 'date-fns';
import { ImportTreeForm } from 'forms';
import { useAdminOfHats } from 'hats-hooks';
import { getProposedChangesCount, handleExportBranch, isTopHatOrMutable } from 'hats-utils';
import { useMediaStyles, useToast } from 'hooks';
import { filter, first, get, gt, includes, last, map, startsWith } from 'lodash';
import posthog from 'posthog-js';
import { AiOutlineDownload, AiOutlineUpload } from 'react-icons/ai';
import { BsChevronRight } from 'react-icons/bs';
import { AppHat } from 'types';
import { Badge, Button, cn, Markdown } from 'ui';
import { Hex } from 'viem';

const isDraft = (hatId: string, onchainHats: AppHat[]) => !includes(map(onchainHats, 'id'), hatId);

const MainContent = ({ isExpanded }: { isExpanded: boolean }) => {
  const {
    topHat,
    onchainHats,
    treeToDisplay,
    treeToDisplayWithInactiveHats,
    storedData,
    treeEvents,
    topHatDetails,
    chainId,
    linkedHatIds,
    onCloseTreeDrawer,
    onOpenHatDrawer,
    editMode,
  } = useTreeForm();
  const { isClient } = useMediaStyles();
  const toast = useToast();
  const localOverlay = useOverlay();

  const { setModals } = localOverlay;

  const topHatCreated = get(last(get(topHat, 'events')), 'timestamp');

  const openImportModal = () => {
    setModals?.({ importFile: true });
  };

  const hatIds = filter(map(storedData, 'id'), (hatId: string | undefined) => hatId !== undefined) as Hex[];
  const { adminHatIds } = useAdminOfHats({ hatIds, chainId });

  const handleExport = () =>
    handleExportBranch({
      targetHatId: topHat?.id,
      treeToDisplayWithInactiveHats,
      linkedHatIds,
      storedData,
      chainId,
      toast,
    });

  if (!onchainHats || !treeToDisplay) return null;

  return (
    <div className='relative top-16 h-[calc(100%-75px)] h-full w-full space-y-10 overflow-scroll p-10 pb-20 pt-8'>
      <div className='flex items-start justify-between'>
        <div className='w-3/4'>
          <h2 className='text-lg font-medium'>{topHatDetails?.name || topHat?.details || topHat?.name || 'No Hats'}</h2>

          {topHatDetails?.description && <Markdown>{topHatDetails?.description}</Markdown>}

          {isClient && (
            <p className='max-w-[80%] text-sm text-gray-500'>
              Created {topHatCreated && formatDistanceToNow(new Date(Number(topHatCreated) * 1000))} ago. Last edited{' '}
              {/* treeEvents is sorted by recent timestamp */}
              {get(first(treeEvents), 'timestamp') &&
                formatDistanceToNow(new Date(Number(get(first(treeEvents), 'timestamp')) * 1000))}{' '}
              ago.
            </p>
          )}

          {!topHatDetails?.description && <div className='h-12' />}
        </div>

        <div className='flex flex-col gap-2'>
          <Button variant='outline' onClick={openImportModal}>
            <AiOutlineUpload className='mr-1 size-4' />
            Import
          </Button>

          <Button variant='outline-blue' disabled={treeToDisplay?.length === 1} onClick={handleExport}>
            <AiOutlineDownload className='mr-1 size-4' />
            Export
          </Button>
        </div>
      </div>

      <div className='space-y-2'>
        <h2 className='text-lg font-medium'>Drafted Changes</h2>
        <p>Propose changes to any hat. Deploy changes to the Hats you control.</p>
      </div>

      <div className='border-y border-gray-200'>
        {map(treeToDisplay, (hat: AppHat) => {
          const draft = isDraft(hat.id, onchainHats);
          const changes = getProposedChangesCount(hat.id, storedData);

          const hatId = hatIdDecimalToIp(BigInt(hat.id));
          // get hat name for list display, default to details name
          let displayName = get(hat, 'detailsObject.data.name') || hat.name;
          if (displayName === hatId && !startsWith(hat.details, 'ipfs://')) {
            displayName = hat.details;
          }
          const localDisplayName = get(hat, 'displayName', '');
          if (localDisplayName !== '') {
            displayName = localDisplayName;
          }

          const handleHatClick = () => {
            posthog.capture('Opened Hat Drawer', {
              chain_id: chainId,
              hat_id: hatId,
              hat_name: displayName,
              draft,
              edit_mode: editMode,
              from: 'Tree Drawer',
            });
            onCloseTreeDrawer?.();
            onOpenHatDrawer?.(hat.id);
          };

          const isAdmin = includes(adminHatIds, hat.id);

          return (
            <div className='w-full border-b border-gray-300' key={hat.id}>
              <Button
                className='variant-ghost align-center h-10 w-full justify-between rounded-none border-0'
                onClick={handleHatClick}
              >
                <div className='flex items-center gap-2'>
                  <p>{hatId}</p>
                  {displayName && displayName !== hatId && (
                    <p className={cn('max-w-[160px] truncate', hat.mutable && !changes && 'max-w-[300px]')}>
                      {displayName}
                    </p>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  {draft ? (
                    <Badge
                      className={cn('border border-green-500 text-sm uppercase', {
                        'bg-green-500 text-white': isAdmin,
                      })}
                    >
                      {isAdmin ? 'Deployable Draft' : 'New!'}
                    </Badge>
                  ) : (
                    changes && (
                      <Badge
                        className={cn(
                          'text-sm uppercase',
                          isAdmin ? 'bg-blue-500 text-white' : 'bg-cyan-500 text-white',
                        )}
                      >
                        {changes}
                        {isAdmin ? ' Deployable Edit' : ' Change'}
                        {gt(changes, 1) ? 'S' : ''}
                      </Badge>
                    )
                  )}
                  {!isTopHatOrMutable(hat) && (
                    <Badge className='bg-gray-500 text-sm uppercase text-white'>IMMUTABLE</Badge>
                  )}

                  <BsChevronRight />
                </div>
              </Button>
            </div>
          );
        })}
      </div>

      <Modal name='importFile' title='Import Draft Tree Changes'>
        <ImportTreeForm />
      </Modal>
    </div>
  );
};

export { MainContent };

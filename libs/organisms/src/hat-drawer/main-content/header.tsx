'use client';

import { MUTABILITY, STATUS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useHatStatus, useWearerDetails } from 'hats-hooks';
import { useClipboard, useMediaStyles } from 'hooks';
import { find, get, includes, map, pick } from 'lodash';
import dynamic from 'next/dynamic';
import { Badge, Button, cn, LazyImage, Markdown, Skeleton, Tooltip } from 'ui';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const CopyHash = dynamic(() => import('icons').then((mod) => mod.CopyHash));

const Header = () => {
  const { address } = useAccount();
  const { chainId, editMode, treeToDisplay } = useTreeForm();
  const { selectedHat, selectedHatDetails, hatLoading } = useSelectedHat();

  const { onCopy: copyHatId } = useClipboard(selectedHat?.id || '', {
    toastData: {
      title: 'Successfully copied hat ID to clipboard',
      // status: 'info',
    },
  });
  const { isMobile } = useMediaStyles();

  const { name, description } = pick(selectedHatDetails, ['name', 'description']);
  const imageUrl = get(find(treeToDisplay, { id: selectedHat?.id }), 'imageUrl');

  const { data: wearer } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
    editMode,
  });
  const isCurrentWearer = includes(map(wearer, 'id'), selectedHat?.id);

  const levelAtLocalTree = selectedHat?.levelAtLocalTree || 0;
  const mutableStatus = selectedHat?.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE;

  const { data: hatStatus } = useHatStatus({
    selectedHat,
    chainId,
  });
  const activeStatus = selectedHat?.status && hatStatus ? STATUS.ACTIVE : STATUS.INACTIVE;

  if (!selectedHat) return null;

  return (
    <div className='space-y-4 bg-white px-4 pb-4 md:bg-transparent md:px-16'>
      <div className='w-full gap-1 space-y-2'>
        <div className='min-h-150 md:min-h-auto pt-50 align-end flex w-full flex-col md:flex-row md:pt-0'>
          {isMobile && <LazyImage src={imageUrl} alt='hat image' containerClassName='size-120' />}

          <div className='max-w-2/3 flex w-full flex-col justify-between gap-2 md:max-w-full md:flex-row'>
            <Tooltip label={name || selectedHat?.details}>
              <h2 className='line-clamp-2 text-2xl font-medium md:line-clamp-1'>{name || selectedHat?.details}</h2>
            </Tooltip>

            <div>
              <Button variant='link' color='Functional-LinkPrimary' onClick={copyHatId}>
                {hatIdDecimalToIp(BigInt(selectedHat?.id || 0))}
                <CopyHash className='ml-1 size-4' />
              </Button>
            </div>
          </div>
        </div>
        {description && (
          <div className='opacity-60'>
            <Markdown>{description}</Markdown>
          </div>
        )}
      </div>

      <div className='flex justify-center md:justify-start'>
        <div className='flex flex-col gap-2'>
          {isCurrentWearer && <Badge className='bg-green-500'>My Hat</Badge>}

          <Badge
            className={cn(
              mutableStatus === MUTABILITY.MUTABLE || levelAtLocalTree === 0 ? 'bg-blue-500' : 'bg-red-500',
            )}
          >
            {levelAtLocalTree === 0 ? 'Top Hat' : mutableStatus}
          </Badge>

          {levelAtLocalTree > 0 && (
            <>
              <Badge className={cn(activeStatus === STATUS.ACTIVE ? 'bg-green-500' : 'bg-red-500')}>
                {activeStatus}
              </Badge>

              <Badge>Level {levelAtLocalTree}</Badge>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { Header };

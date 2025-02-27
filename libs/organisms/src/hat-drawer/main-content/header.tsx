'use client';

import { MUTABILITY, STATUS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useHatStatus, useWearerDetails } from 'hats-hooks';
import { useClipboard } from 'hooks';
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

  const { name, description } = pick(selectedHatDetails, ['name', 'description']);
  const imageUrl = get(find(treeToDisplay, { id: selectedHat?.id }), 'imageUrl');

  const { data: wearer, isLoading: wearerLoading } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
    editMode,
  });
  const isCurrentWearer = includes(map(wearer, 'id'), selectedHat?.id);

  const levelAtLocalTree = selectedHat?.levelAtLocalTree || 0;
  const mutableStatus = selectedHat?.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE;

  const { data: hatStatus, isLoading: hatStatusLoading } = useHatStatus({
    selectedHat,
    chainId,
  });
  const activeStatus = selectedHat?.status && hatStatus ? STATUS.ACTIVE : STATUS.INACTIVE;

  if (!selectedHat) return null;

  if (hatLoading || hatStatusLoading || wearerLoading) {
    return (
      <div className='space-y-4 bg-white px-4 pb-4 md:bg-transparent md:px-16'>
        <div className='w-full space-y-2'>
          <div className='min-h-150 md:min-h-auto pt-50 align-end flex w-full flex-col md:flex-row md:pt-0'>
            <Skeleton className='block size-96 md:hidden' />

            <div className='max-w-2/3 flex w-full flex-col justify-between gap-2 md:max-w-full md:flex-row'>
              <Skeleton className='h-6 w-full' />

              <div>
                <Skeleton className='h-4 w-20' />
              </div>
            </div>
          </div>

          <div>
            <Skeleton className='h-12 w-full' />
          </div>

          <div>
            <Skeleton className='h-4 w-1/2' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4 bg-white pb-4 md:bg-transparent md:px-16'>
      <div className='w-full gap-1 space-y-2'>
        <div className='flex min-h-[150px] w-full flex-col md:min-h-0 md:flex-row md:pt-0'>
          <LazyImage src={imageUrl} alt='hat image' containerClassName={cn('block h-[400px] md:hidden')} />

          <div className='flex w-full flex-row items-center justify-between gap-2 px-4 py-4 md:max-w-full md:px-0'>
            <Tooltip label={name || selectedHat?.details}>
              <h2 className='line-clamp-1 text-2xl font-medium md:line-clamp-1'>{name || selectedHat?.details}</h2>
            </Tooltip>

            <div>
              <Button
                variant='link'
                className='text-functional-link-primary hover:text-functional-link-primary/80 hover:no-underline'
                onClick={copyHatId}
              >
                {hatIdDecimalToIp(BigInt(selectedHat?.id || 0))}
                <CopyHash className='ml-1 size-4' />
              </Button>
            </div>
          </div>
        </div>
        {description && (
          <div className='mx-4 opacity-60 md:mx-0'>
            <Markdown>{description}</Markdown>
          </div>
        )}
      </div>

      <div className='flex justify-center md:justify-start'>
        <div className='flex gap-2'>
          {isCurrentWearer && <Badge className='bg-functional-success'>My Hat</Badge>}

          <Badge
            className={cn(
              mutableStatus === MUTABILITY.MUTABLE || levelAtLocalTree === 0
                ? 'bg-functional-link-primary'
                : 'bg-destructive',
            )}
          >
            {levelAtLocalTree === 0 ? 'Top Hat' : mutableStatus}
          </Badge>

          {levelAtLocalTree > 0 && (
            <>
              <Badge className={cn(activeStatus === STATUS.ACTIVE ? 'bg-functional-success' : 'bg-destructive')}>
                {activeStatus}
              </Badge>

              <Badge className='bg-gray-400'>Level {levelAtLocalTree}</Badge>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { Header };

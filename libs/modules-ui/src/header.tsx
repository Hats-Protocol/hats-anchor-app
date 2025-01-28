'use client';

import { MUTABILITY, STATUS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { useClipboard } from 'hooks';
import { get, pick } from 'lodash';
import dynamic from 'next/dynamic';
import { Badge, Button, cn, LazyImage, Markdown, Skeleton, Tooltip } from 'ui';

const CopyHash = dynamic(() => import('icons').then((mod) => mod.CopyHash));

export const Header = () => {
  const { selectedHat, isHatDetailsLoading, selectedHatDetails } = useEligibility();
  const { onCopy } = useClipboard(selectedHat?.id as string); // TODO toastData: { title: 'Successfully copied hat ID to clipboard' },

  const { name, description } = pick(selectedHatDetails, ['name', 'description']);

  const levelAtLocalTree = selectedHat?.levelAtLocalTree || 0;
  const mutableStatus = selectedHat?.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE;
  const activeStatus = selectedHat?.status ? STATUS.ACTIVE : STATUS.INACTIVE;

  if (isHatDetailsLoading) {
    return (
      <div className='flex w-full flex-col gap-2 pb-2'>
        <div className='w-full'>
          <LazyImage
            src={!isHatDetailsLoading ? get(selectedHat, 'imageUrl') : undefined}
            alt='Hat image'
            containerClassName='rounded-none md:rounded-lg md:w-auto h-full md:h-[400px]'
          />

          <div className='relative flex justify-center'>
            <Skeleton className='h-40px absolute top-[-10px]' />
          </div>
        </div>

        <div className='flex w-full flex-col gap-2 px-4 pt-10'>
          <div className='flex w-full items-baseline justify-between'>
            <Skeleton className='min-w-100px h-8 rounded-sm' />

            <Skeleton className='min-w-50px' />
          </div>

          <Skeleton className='h-60px w-full rounded-md' />
        </div>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col gap-2 pb-2'>
      <div className='w-full'>
        <LazyImage
          src={!isHatDetailsLoading ? get(selectedHat, 'imageUrl') : undefined}
          alt='Hat image'
          containerClassName='rounded-none md:rounded-lg md:w-auto h-full md:h-[400px]'
        />

        <div className='relative flex justify-center'>
          <div className='flex gap-2'>
            {/* {isCurrentWearer && <Badge colorScheme='green'>My Hat</Badge>} */}

            <Badge className={cn('shadow-sm', mutableStatus === MUTABILITY.MUTABLE ? 'bg-blue-500' : 'bg-red-500')}>
              {mutableStatus}
            </Badge>

            <Badge className={cn('shadow-sm', activeStatus === STATUS.ACTIVE ? 'bg-green-500' : 'bg-red-500')}>
              {activeStatus}
            </Badge>

            <Badge className='shadow-sm'>Level {levelAtLocalTree}</Badge>
          </div>
        </div>
      </div>

      <div className='flex w-full flex-col gap-2 px-4 pt-10'>
        <div className='flex w-full items-baseline justify-between'>
          <Tooltip label={name || selectedHat?.details}>
            <h2 className='text-2xl font-bold'>{name || selectedHat?.details}</h2>
          </Tooltip>

          <Button variant='link' color='blue.500' onClick={onCopy}>
            <p>{hatIdDecimalToIp(BigInt(selectedHat?.id || 0))}</p>
            <CopyHash className='h-4 w-4' />
          </Button>
        </div>

        {description && (
          <div>
            <Markdown collapse maxHeight={70}>
              {description}
            </Markdown>
          </div>
        )}
      </div>
    </div>
  );
};

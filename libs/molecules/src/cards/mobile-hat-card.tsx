'use client';

import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetailsField } from 'hats-hooks';
import { get } from 'lodash';
import dynamic from 'next/dynamic';
import { BsPersonBadge } from 'react-icons/bs';
import { HatWithDepth, SupportedChains } from 'types';
import { Card, cn, LazyImage, Link, Skeleton } from 'ui';
import { paddingForMaxDepth } from 'utils';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const MobileHatCard = ({ hat, chainId, isWearing, ensName, maxDepth }: HatCardProps) => {
  const { data: hatDetails } = useHatDetailsField(
    get(hat, 'name') ? undefined : get(hat, 'details'), // don't attempt to lookup if name already found for hat
  );
  const detailsName = get(hatDetails, 'data.name', get(hat, 'name', get(hat, 'details')));

  // trying to match the right value in `VerticalDividers` (4), 3 seems to be best here
  const padding = maxDepth ? (get(hat, 'depth', 0) - 1) * paddingForMaxDepth(maxDepth) + 1 : undefined;
  if (!get(hat, 'id')) return null;

  if (!hat.details) {
    return <Skeleton className='h-full min-h-[72px]' />;
  }

  return (
    <Link
      href={`/trees/${chainId || hat.chainId}/${hatIdToTreeId(BigInt(hat.id))}/${hatIdDecimalToIp(BigInt(hat.id))}`}
      // don't adjust top hat (or hat used throughout the app) width
      className={cn('block', `${!maxDepth || (hat?.depth || 0) <= 1 ? 'w-full' : `calc(100% - ${padding}px)`}`)} // subtract left margin from card width
    >
      <Card className='border-1 rounded-6 flex h-72 overflow-hidden border-gray-600'>
        <div className='flex w-full items-center justify-between'>
          <LazyImage
            src={get(hat, 'imageUrl')}
            alt={`${detailsName} image`}
            containerClassName='size-72'
            imageClassName='absolute top-[-2px] left-[-2px]'
          />

          <div className='pl-78 flex flex-col gap-1 pt-1'>
            <p className='text-xs font-medium'>{hatIdDecimalToIp(BigInt(hat.id))}</p>

            <p className='text-md'>{detailsName}</p>
          </div>

          {isWearing && <HatIcon className='absolute right-2 top-2 size-4 text-green-500' />}
        </div>

        {isWearing && (
          <div className='border-t-1 flex items-center gap-2 border-gray-600 bg-green-50 p-1'>
            <BsPersonBadge className='size-4' />

            <p>{ensName || 'You are wearing this hat'}</p>
          </div>
        )}
      </Card>
    </Link>
  );
};

interface HatCardProps {
  hat: HatWithDepth;
  chainId?: SupportedChains;
  isWearing?: boolean;
  ensName?: string | null;
  maxDepth?: number;
}

export { MobileHatCard };

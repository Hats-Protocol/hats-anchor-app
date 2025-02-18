'use client';

import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetailsField } from 'hats-hooks';
import { get } from 'lodash';
import dynamic from 'next/dynamic';
import { BsPersonBadge } from 'react-icons/bs';
import { HatWithDepth, SupportedChains } from 'types';
import { Card, cn, LazyImage, Link, Skeleton } from 'ui';
import { ipfsUrl, paddingForMaxDepth } from 'utils';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const MobileHatCard = ({ hat, chainId, isWearing, ensName, maxDepth }: HatCardProps) => {
  const rawDetails = get(hat, 'detailsMetadata');
  const detailsMetadata = rawDetails ? JSON.parse(rawDetails) : undefined;
  const { data: hatDetails, isLoading: hatDetailsLoading } = useHatDetailsField(
    detailsMetadata ? undefined : get(hat, 'details'), // don't attempt to lookup if name already found for hat
  );
  const detailsName = get(
    detailsMetadata,
    'data.name',
    get(hatDetails, 'data.name', get(hat, 'name', get(hat, 'details'))),
  );

  // trying to match the right value in `VerticalDividers` (4), 3 seems to be best here
  const padding = maxDepth ? (get(hat, 'depth', 0) - 1) * paddingForMaxDepth(maxDepth) + 1 : undefined;
  if (!get(hat, 'id')) return null;

  const nearestImageUrl = get(hat, 'nearestImage') ? ipfsUrl(get(hat, 'nearestImage')) : get(hat, 'imageUrl');

  if (hatDetailsLoading) {
    return <Skeleton className='h-[72px]' />;
  }

  return (
    <Link
      href={`/trees/${chainId || hat.chainId}/${hatIdToTreeId(BigInt(hat.id))}/${hatIdDecimalToIp(BigInt(hat.id))}`}
      // don't adjust top hat (or hat used throughout the app) width
      className={cn('flex', (!maxDepth || (hat?.depth || 0) <= 1) && 'w-full')}
      style={{ width: `calc(100% - ${padding}px)` }}
      // subtract left margin from card width
    >
      <Card className='flex h-20 w-full overflow-hidden rounded-lg border'>
        <div className='flex w-full items-center'>
          <LazyImage
            src={nearestImageUrl || get(hat, 'imageUrl')}
            alt={`${detailsName} image`}
            containerClassName='size-20'
            imageClassName='absolute top-[-2px] left-[-2px]'
          />

          <div className='flex max-w-[75%] flex-col gap-1 pl-2 pt-1'>
            <p className='text-xs font-medium'>{hatIdDecimalToIp(BigInt(hat.id))}</p>

            <p className='text-md line-clamp-1'>{detailsName}</p>
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

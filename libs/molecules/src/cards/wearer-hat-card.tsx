'use client';

import {
  hatIdDecimalToHex,
  hatIdDecimalToIp,
  hatIdHexToDecimal,
  hatIdToTreeId,
  treeIdToTopHatId,
} from '@hatsprotocol/sdk-v1-core';
import { useHatDetails } from 'hats-hooks';
import { get } from 'lodash';
import { AppHat, SupportedChains } from 'types';
import { Card, LazyImage, Link, Skeleton } from 'ui';
import { ipfsUrl } from 'utils';

// TODO optimize top hat fetch
const WearerHatCard = ({ hat, chainId }: { hat: AppHat; chainId: SupportedChains | undefined }) => {
  const hatDetails = hat.detailsMetadata ? JSON.parse(hat.detailsMetadata) : hat;

  // TODO need topHatId from hatId util
  const {
    details: topHatDetails,
    data: topHat,
    isLoading: isTopHatLoading,
  } = useHatDetails({
    hatId: hatIdDecimalToHex(treeIdToTopHatId(hatIdToTreeId(hatIdHexToDecimal(get(hat, 'id'))))),
    chainId,
  });

  const hatName = get(hatDetails, 'data.name', get(hat, 'details'));

  const topHatName = get(topHatDetails, 'name', get(topHat, 'details'));

  if (isTopHatLoading) {
    return <Skeleton className='size-[323px]' />;
  }

  return (
    <Link
      href={`/trees/${get(hat, 'chainId')}/${Number(hatIdToTreeId(BigInt(get(hat, 'id'))))}?hatId=${hatIdDecimalToIp(BigInt(get(hat, 'id')))}`}
    >
      <Card key={get(hat, 'id')} className='overflow-hidden rounded-md border-2 border-gray-600'>
        <LazyImage
          src={ipfsUrl(get(hat, 'nearestImage'))}
          alt={`${hatName} image`}
          containerClassName='border border-gray-200 size-[330px] -ml-1 -mt-1'
          imageClassName='-left-4 -top-4'
        />
        <div className='border-y-1 mt-[-1px] border-gray-600 bg-white p-2'>
          <div className='flex justify-between gap-2'>
            <p className='text-xs'>{topHatName}</p>
            <p className='text-xs text-gray-500'>{hatIdDecimalToIp(BigInt(get(hat, 'id')))}</p>
          </div>

          <p className='text-md line-clamp-1'>{hatName}</p>
        </div>
      </Card>
    </Link>
  );
};

export { WearerHatCard };

'use client';

import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails, useHatDetailsField } from 'hats-hooks';
import { getTreeId } from 'hats-utils';
import { get } from 'lodash';
import { AppHat, SupportedChains } from 'types';
import { Card, LazyImage, Link } from 'ui';

// TODO optimize top hat fetch
const WearerHatCard = ({ hat, chainId }: { hat: AppHat; chainId: SupportedChains | undefined }) => {
  const hatDetails = hat.detailsMetadata ? JSON.parse(hat.detailsMetadata) : hat;

  // TODO need topHatId from hatId util
  const { details: topHatDetails, data: topHat } = useHatDetails({
    hatId: getTreeId(get(hat, 'id'), true),
    chainId,
  });

  const hatName = get(hatDetails, 'data.name', get(hat, 'details'));

  const topHatName = get(topHatDetails, 'name', get(topHat, 'details'));

  return (
    <Link
      href={`/trees/${get(hat, 'chainId')}/${Number(hatIdToTreeId(BigInt(get(hat, 'id'))))}?hatId=${hatIdDecimalToIp(BigInt(get(hat, 'id')))}`}
    >
      <Card key={get(hat, 'id')} className='overflow-hidden rounded-md border-2 border-gray-600'>
        <LazyImage
          src={get(hat, 'imageUrl')}
          alt={`${hatName} image`}
          containerClassName='border border-gray-200 size-[323px]'
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

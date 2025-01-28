'use client';

import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails, useHatDetailsField } from 'hats-hooks';
import { getTreeId } from 'hats-utils';
import { get } from 'lodash';
import { AppHat, SupportedChains } from 'types';
import { Card, Link } from 'ui';

// TODO optimize top hat fetch
const WearerHatCard = ({ hat, chainId }: { hat: AppHat; chainId: SupportedChains | undefined }) => {
  const { data: hatDetails } = useHatDetailsField(get(hat, 'details'));

  // TODO need topHatId from hatId
  const { data: topHat } = useHatDetails({
    hatId: getTreeId(get(hat, 'id'), true),
    chainId,
  });
  const { data: topHatDetails } = useHatDetailsField(get(topHat, 'details'));

  const hatName = hatDetails?.type === '1.0' ? get(hatDetails, 'data.name') : get(hat, 'details');

  const topHatName = topHatDetails?.type === '1.0' ? get(topHatDetails, 'data.name') : get(topHat, 'details');

  return (
    <Link
      href={`/trees/${get(hat, 'chainId')}/${Number(hatIdToTreeId(BigInt(get(hat, 'id'))))}?hatId=${hatIdDecimalToIp(BigInt(get(hat, 'id')))}`}
    >
      <Card key={get(hat, 'id')} className='overflow-hidden border-2 border-gray-600'>
        <div
          style={{ backgroundImage: get(hat, 'imageUrl') || '/icon.jpeg' }}
          className='w-110% h-250px border-1 ml-[-3px] mt-[-1px] border-gray-200 bg-cover bg-center'
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

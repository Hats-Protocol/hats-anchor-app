'use client';

import { NETWORK_IMAGES } from '@hatsprotocol/config';
import { useTreasury } from 'contexts';
import { get } from 'lodash';
import { chainsMap, ipfsUrl } from 'utils';

const TreeOverview = () => {
  const { treeDetails, chainId } = useTreasury();
  const topHatDetails = get(treeDetails, 'hats[0].detailsMetadata');
  const topHatName = topHatDetails ? get(JSON.parse(topHatDetails), 'data.name') : get(treeDetails, 'hats[0].details');
  const topHatImage = get(treeDetails, 'hats[0].nearestImage');
  const chain = chainsMap(chainId);

  if (!chainId) return null;

  return (
    <div className='flex justify-center bg-gray-200 py-16'>
      <div className='flex flex-col items-center'>
        <div className='mx-auto flex gap-2'>
          <div className='w-7'>&nbsp;</div>
          <div className='bg-white'>
            <div
              className='rounded-lg border-2 border-black bg-cover bg-center'
              style={{
                backgroundImage: topHatImage ? `url(${ipfsUrl(topHatImage)})` : '/icon.jpeg',
              }}
            />
          </div>
          <img src={NETWORK_IMAGES[chainId]} alt={`${chain?.name}`} className='h-7 w-7' />
        </div>
        <h1 className='text-center'>{topHatName}</h1>
        {/* <p className='text-center italic'>Roles with budgets</p> */}
      </div>
    </div>
  );
};

export { TreeOverview };

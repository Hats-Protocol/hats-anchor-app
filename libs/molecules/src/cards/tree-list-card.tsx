'use client';

import { treeIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useMediaStyles } from 'hooks';
import { get, size } from 'lodash';
import dynamic from 'next/dynamic';
// import { BsPeopleFill } from 'react-icons/bs';
import { AppTree } from 'types';
import { Card, Link } from 'ui';
import { checkIfIpfs, removeInactiveHatsAndDescendants } from 'utils';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

// TODO migrate Top Hat image to LazyImage

const TreeStats = ({ tree }: { tree: AppTree }) => {
  const activeHats = removeInactiveHatsAndDescendants(tree?.hats);
  // const activeWearers = _.size(_.uniq(_.flatten(_.map(activeHats, 'wearers'))));

  return (
    <div className='flex gap-1'>
      <div className='flex gap-1 text-blue-700'>
        <HatIcon className='size-3' />

        <p className='text-xs font-medium'>{size(activeHats)}</p>
      </div>

      {/* <div className='flex gap-1 text-blue-700'>
        <BsPeopleFill className='size-3' />
        <p className='text-xs font-medium'>{activeWearers}</p>
      </div> */}
    </div>
  );
};

const TreeListCard = ({ tree, chainId }: { tree: AppTree; chainId: number }) => {
  const { isMobile } = useMediaStyles();
  const topHat = get(tree, 'hats[0]');
  const metadata = get(topHat, 'metadata');

  const hatName = get(metadata, 'name', get(topHat, 'details'));
  const nearestImageRaw = checkIfIpfs(get(topHat, 'nearestImage'));
  const nearestImage = nearestImageRaw ? nearestImageRaw.imageUrl : undefined;

  return (
    <Link href={`/trees/${chainId}/${treeIdHexToDecimal(tree?.id)}`} key={`${chainId}-${get(tree, 'id')}`}>
      <Card className='border-1 rounded-6 flex h-full w-full flex-col items-center justify-center overflow-hidden border-gray-600'>
        <div className='flex w-full items-center justify-between'>
          <div className='h-85 sm:h-100 md:w-90 justify-left w-full flex-col items-center'>
            {/* TOP HAT IMAGE */}
            <div
              className='w-85 h-85 border-r-1 rounded-5 border-gray-600 bg-cover bg-center'
              style={{ backgroundImage: nearestImage ? `url(${nearestImage})` : `url('/icon.jpeg')` }}
            />

            <div className='h-100% md:justify-space-around md:w-50 w-80 flex-col justify-start'>
              {/* TOP HAT INFO */}
              {isMobile ? (
                <div className='h-100% w-100% flex flex-col justify-between py-2'>
                  <p className='text-md md:max-w-auto line-clamp-2 max-w-[270px]'>{hatName}</p>
                  <div className='w-100% flex justify-between'>
                    <p className='text-xs'>#{treeIdHexToDecimal(get(tree, 'id'))}</p>
                    <TreeStats tree={tree} />
                  </div>
                </div>
              ) : (
                <div className='h-100% w-100% flex flex-col justify-between py-2'>
                  <p className='text-xs'>#{treeIdHexToDecimal(get(tree, 'id'))}</p>
                  <p className='md:max-w-auto line-clamp-2 max-w-[270px] text-sm'>{hatName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export { TreeListCard };

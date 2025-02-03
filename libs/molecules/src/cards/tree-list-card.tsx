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
    <Link
      href={`/trees/${chainId}/${treeIdHexToDecimal(tree?.id)}`}
      key={`${chainId}-${get(tree, 'id')}`}
      className='shadow'
    >
      <Card className='flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md border border-gray-300'>
        <div className='flex w-full items-center justify-between'>
          <div className='flex h-full items-center justify-start gap-3'>
            {/* TOP HAT IMAGE */}
            <div
              className='border-r-1 rounded-5 size-[85px] border-gray-600 bg-cover bg-center'
              style={{ backgroundImage: nearestImage ? `url(${nearestImage})` : `url('/icon.jpeg')` }}
            />

            <div className='line-clamp-2 h-full max-w-[175px] flex-col justify-start md:justify-around'>
              {/* TOP HAT INFO */}
              {isMobile ? (
                <div className='flex h-full w-full flex-col gap-3'>
                  <p className='text-md md:max-w-auto line-clamp-2 max-w-[270px]'>{hatName}</p>
                  <div className='flex w-full justify-between'>
                    <p className='text-xs'>#{treeIdHexToDecimal(get(tree, 'id'))}</p>
                    <TreeStats tree={tree} />
                  </div>
                </div>
              ) : (
                <div className='flex h-full w-full items-center'>
                  <div className='flex flex-col gap-3'>
                    <p className='text-xs'>#{treeIdHexToDecimal(get(tree, 'id'))}</p>
                    <p className='md:max-w-auto line-clamp-2 max-w-[270px]'>{hatName}</p>
                  </div>
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

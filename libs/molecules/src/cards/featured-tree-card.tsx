'use client';

import { TemplateData } from '@hatsprotocol/config';
import dynamic from 'next/dynamic';
import { BsPeopleFill } from 'react-icons/bs';
import { LazyImage, Link, Skeleton, Tooltip } from 'ui';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const FeaturedTreeCard = ({ treeData, hatsAndWearers }: FeatureTreeCardProps) => {
  const { id, name, chainId, image, avatar } = treeData;

  if (!treeData) {
    return <Skeleton className='h-full min-h-[207px]' />;
  }

  return (
    <Link href={`/trees/${chainId}/${id}`} className='h-full min-h-[207px]'>
      <div className='border-6 rounded-6 flex h-full justify-between border-gray-600 bg-white'>
        <div className='border-t-6 rounded-t-6 h-48 flex-1 bg-gray-100'>
          <LazyImage src={image} alt={`${name} featured image`} containerClassName='h-48 w-full' />
        </div>

        <div className='relative z-10 w-full px-4 py-2 shadow-md'>
          <div className='mt-[-37.5px] inline-block'>
            <LazyImage src={avatar} alt={`${name} featured avatar`} containerClassName='size-18' />
          </div>

          <div className='ml-2 flex h-full w-full justify-between'>
            <p className='text-xl font-medium'>{name}</p>

            <div className='flex flex-col items-end gap-0.5'>
              <Tooltip label={!!hatsAndWearers?.hats ? `${hatsAndWearers?.hats} hats` : undefined}>
                <div className='flex items-center gap-1'>
                  <HatIcon className='size-3' />

                  <p className='text-xs'>{treeData?.hats || hatsAndWearers?.hats || '--'}</p>
                </div>
              </Tooltip>

              <Tooltip label={!!hatsAndWearers?.wearers ? `${hatsAndWearers?.wearers} wearers` : undefined}>
                <div className='flex items-center gap-1'>
                  <BsPeopleFill className='size-3' />

                  <p className='text-xs'>{treeData?.wearers || hatsAndWearers?.wearers}</p>
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

interface FeatureTreeCardProps {
  treeData: TemplateData;
  hatsAndWearers?: {
    treeId?: string;
    hats?: number;
    wearers?: number;
  };
}

export { FeaturedTreeCard };

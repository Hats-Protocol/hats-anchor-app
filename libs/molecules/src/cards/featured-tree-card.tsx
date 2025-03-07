'use client';

import { TemplateData } from '@hatsprotocol/config';
import { HatIcon } from 'icons';
import { BsPeopleFill } from 'react-icons/bs';
import { Card, LazyImage, Link, Skeleton, Tooltip } from 'ui';

const FeaturedTreeCard = ({ treeData, hatsAndWearers }: FeatureTreeCardProps) => {
  const { id, name, chainId, image, avatar } = treeData;

  if (!treeData) {
    return <Skeleton className='h-full min-h-[207px]' />;
  }

  return (
    <Link href={`/trees/${chainId}/${id}`} className='h-full min-h-[207px] rounded-md hover:no-underline'>
      <Card className='flex h-full flex-col justify-between rounded-md border border-gray-600 bg-white'>
        <div className='h-48 flex-1 rounded-t-md border-t bg-gray-100'>
          <LazyImage src={image} alt={`${name} featured image`} containerClassName='h-48 w-full rounded-t-md' />
        </div>

        <div className='relative z-[4] w-full rounded-b-md px-4 py-2 shadow-md'>
          <div className='absolute mt-[-37.5px]'>
            <LazyImage src={avatar} alt={`${name} featured avatar`} containerClassName='size-16' />
          </div>

          <div className='flex w-full justify-between pl-20'>
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
      </Card>
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

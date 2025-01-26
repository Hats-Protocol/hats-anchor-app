'use client';

import { LazyImage, Link } from 'ui';

const ForkableTemplateCard = ({ treeData }: ForkableTemplateCardProps) => {
  const { id, name, chainId, image, description } = treeData;

  return (
    <Link href={`/trees/${chainId}/${id}`}>
      <div className='max-w-400px border-radius-6 border-1 h-full border-gray-600 bg-white'>
        <div className='border-right-1 relative z-10 h-full w-full border-gray-200 px-4 py-4'>
          <h3 className='text-md'>{name}</h3>
          <p className='text-sm'>{description}</p>
        </div>

        <div className='border-top-radius-6 mr-1 bg-[#EDF1F7]'>
          <LazyImage src={image} alt={`${name} featured image`} containerClassName='w-175px h-full' />
        </div>
      </div>
    </Link>
  );
};

interface ForkableTemplateCardProps {
  treeData: {
    chainId: number;
    id: number;
    image: string;
    name: string;
    description: string;
  };
}

export { ForkableTemplateCard };

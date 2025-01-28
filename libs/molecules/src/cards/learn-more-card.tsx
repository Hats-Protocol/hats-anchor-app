'use client';

import { IconType } from 'react-icons';
import { DocsLink } from 'types';
import { Card, Link } from 'ui';

const LearnMoreCard = ({ docsData }: FeatureDocsCardProps) => {
  const { url, name, icon, image, description } = docsData;

  let displayIcon;
  if (image) {
    displayIcon = <img src={image} alt={`${name} featured icon`} className='fit-cover size-8' />;
  } else {
    if (!icon) return null;
    const Icon = icon as IconType;
    displayIcon = <Icon className='size-6' />;
  }

  return (
    <Link href={url} isExternal>
      <Card className='bg-whiteAlpha-700 flex h-full items-start gap-6 border-gray-600 p-5'>
        {displayIcon}
        <div>
          <p className='text-md'>{name}</p>
          <p className='text-sm'>{description}</p>
        </div>
      </Card>
    </Link>
  );
};

interface FeatureDocsCardProps {
  docsData: DocsLink;
}

export { LearnMoreCard };

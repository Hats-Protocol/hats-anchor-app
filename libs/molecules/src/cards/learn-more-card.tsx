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
    <Link href={url} className='shadow hover:no-underline' isExternal>
      <Card className='flex h-full items-start gap-6 rounded-md border-gray-400 bg-white/70 p-5'>
        {displayIcon}
        <div>
          <p className='font-medium'>{name}</p>
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

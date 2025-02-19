import { DocsLink } from 'types';
import { Card, Link } from 'ui';

const LearnMoreCard = ({ docsData }: FeatureDocsCardProps) => {
  const { url, name, icon, image, description } = docsData;

  let displayIcon;
  if (image) {
    displayIcon = <img src={image} alt={`${name} featured icon`} className='fit-cover size-8' />;
  } else {
    if (!icon) return null;
    const Icon = icon as any;
    displayIcon = <Icon className='mt-1 size-4 md:mt-0 md:size-6' />;
  }

  return (
    <Link href={url} className='rounded-md shadow hover:no-underline' isExternal>
      <Card className='flex h-full items-start gap-6 rounded-md border-gray-400 bg-white/70 p-5'>
        {displayIcon}
        <div className='flex w-2/3 flex-col gap-2'>
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

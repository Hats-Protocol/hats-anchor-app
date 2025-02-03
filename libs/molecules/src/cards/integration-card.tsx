// 'use client';

import { IntegrationCard as IntegrationCardType } from '@hatsprotocol/config';
import { map, pick } from 'lodash';
import { Card, Link } from 'ui';

const IntegrationCard = ({ integration }: { integration: IntegrationCardType }) => {
  const { label, icons, link } = pick(integration, ['label', 'icons', 'link']);

  return (
    <Link href={link} className='w-full md:w-[48%] xl:w-[23%]' isExternal>
      <Card className='h-full min-w-[200px] rounded-md border border-gray-600'>
        <div className='h-100px bg-functional-link-primary/10 relative flex items-center justify-center overflow-hidden rounded-t-md'>
          <div
            className='absolute h-full w-full bg-clip-border bg-repeat'
            style={{ backgroundImage: 'url("/bg-topography.svg")' }}
          />

          <div className='flex h-24 items-center gap-8'>
            {map(icons, (icon: any, i: number) => {
              const Icon = icon;
              return <Icon key={i} className='size-[40px] text-black/80' />;
            })}
          </div>
        </div>
        <div className='p-2'>
          <p className='text-xl font-medium'>{label}</p>
        </div>
      </Card>
    </Link>
  );
};

export { IntegrationCard };

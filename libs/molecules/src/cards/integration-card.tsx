'use client';

import { IntegrationCard as IntegrationCardType } from '@hatsprotocol/config';
import { map, pick } from 'lodash';
import { Card, Link } from 'ui';

const IntegrationCard = ({ integration }: { integration: IntegrationCardType }) => {
  const { label, icons, link } = pick(integration, ['label', 'icons', 'link']);

  return (
    <Link href={link} className='w-full md:w-[48%] xl:w-[23%]' isExternal>
      <Card className='border-1 min-w-[200px] border-solid'>
        <div className='h-100px border-top-radius-md relative flex items-center justify-center overflow-hidden bg-gray-50'>
          <div
            className='h-100% w-100% bg-image absolute bg-clip-border bg-repeat'
            style={{ backgroundImage: '/bg-topography.svg' }}
          />

          <div className='flex gap-8'>
            {map(icons, (icon: any, i: number) => {
              const Icon = icon;
              return <Icon key={i} className='h-50px min-h-40px text-black/80' />;
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

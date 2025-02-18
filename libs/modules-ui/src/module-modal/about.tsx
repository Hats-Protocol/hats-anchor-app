import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { map } from 'lodash';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { Hex } from 'viem';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

// TODO must include hatId or descriptor
interface ModuleDescriptor {
  label?: string;
  hatId?: Hex;
  icon?: IconType;
  descriptor?: ReactNode;
}

// TODO handle loading skeletons

export const AboutModule = ({
  heading,
  moduleDescriptors,
}: {
  heading: string;
  moduleDescriptors: ModuleDescriptor[];
}) => {
  return (
    <div className='flex flex-col gap-2'>
      <h2 className='text-sm font-bold'>{heading}</h2>

      {map(moduleDescriptors, ({ label, hatId, icon, descriptor }) => {
        if (descriptor) {
          return (
            <div className='flex justify-between' key={label}>
              <p className='text-sm'>{label}</p>

              {descriptor}
            </div>
          );
        }

        if (!hatId) return null;

        const Icon = icon || HatIcon;

        return (
          <div className='flex justify-between' key={label}>
            <p className='text-sm'>{label}</p>

            <div className='flex items-center gap-1'>
              <p className='text-sm'>{hatIdDecimalToIp(hatIdHexToDecimal(hatId))}</p>

              <Icon className='h-4 w-4' />
            </div>
          </div>
        );
      })}
    </div>
  );
};

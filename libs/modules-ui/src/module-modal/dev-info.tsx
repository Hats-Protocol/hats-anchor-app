import { isEmpty, map } from 'lodash';
import { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { Hex } from 'viem';

// TODO combine with molecules/dev-info

// canonical in about
interface ModuleDescriptor {
  label?: string;
  hatId?: Hex;
  icon?: IconType;
  descriptor?: ReactNode;
}

export const DevInfo = ({ moduleDescriptors }: DevInfoProps) => {
  const devFlag = false || process.env.NODE_ENV !== 'production';

  if (!moduleDescriptors || isEmpty(moduleDescriptors) || !devFlag) return null;

  return (
    <div className='flex flex-col gap-2'>
      <h2 className='text-sm font-semibold'>Dev Info</h2>

      {map(moduleDescriptors, (descriptor) => {
        return (
          <div className='flex w-full justify-between' key={descriptor.label}>
            <div className='text-sm'>{descriptor.label}</div>

            <div className='text-sm'>{descriptor.descriptor || descriptor.hatId}</div>
          </div>
        );
      })}
    </div>
  );
};

interface DevInfoProps {
  moduleDescriptors: ModuleDescriptor[];
}

import { isEmpty, map } from 'lodash';
import posthog from 'posthog-js';
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
  const devFlag = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';

  if (!moduleDescriptors || isEmpty(moduleDescriptors) || !devFlag) return null;

  return (
    <div>
      <h2 className='text-sm'>Dev Info</h2>

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

import { Heading, Stack } from '@chakra-ui/react';
import { isEmpty, map } from 'lodash';
import posthog from 'posthog-js';
import { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { Hex } from 'viem';

// canonical in about
interface ModuleDescriptor {
  label?: string;
  hatId?: Hex;
  icon?: IconType;
  descriptor?: ReactNode;
}

export const DevInfo = ({ moduleDescriptors }: DevInfoProps) => {
  const devFlag =
    posthog.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';

  if (!moduleDescriptors || isEmpty(moduleDescriptors) || !devFlag) return null;

  return (
    <Stack>
      <Heading size='sm'>Dev Info</Heading>

      {map(moduleDescriptors, (descriptor) => {
        return (
          <div className='flex justify-between' key={descriptor.label}>
            <div className='text-sm'>{descriptor.label}</div>

            <div className='text-sm'>
              {descriptor.descriptor || descriptor.hatId}
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

interface DevInfoProps {
  moduleDescriptors: ModuleDescriptor[];
}

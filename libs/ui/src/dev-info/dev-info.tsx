'use client';

import { Heading, Link, Stack } from '@chakra-ui/react';
import { isEmpty, map } from 'lodash';
import posthog from 'posthog-js';
import { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { Hex } from 'viem';

export interface DevInfoUnit {
  label?: string;
  hatId?: Hex;
  icon?: IconType;
  descriptor?: ReactNode;
  link?: string;
}

export const DevInfo = ({ devInfos }: DevInfoProps) => {
  const devFlag =
    posthog.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';

  if (!devInfos || isEmpty(devInfos) || !devFlag) return null;

  return (
    <Stack>
      <Heading size='sm'>Dev Info</Heading>

      {map(devInfos, ({ label, descriptor }) => {
        return (
          <div className='flex w-full justify-between' key={label}>
            <div className='text-sm'>{label}</div>

            {descriptor}
          </div>
        );
      })}
    </Stack>
  );
};

interface DevInfoProps {
  devInfos: DevInfoUnit[];
}

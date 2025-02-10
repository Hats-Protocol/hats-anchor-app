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

export const DevInfo = ({ title, devInfos }: DevInfoProps) => {
  const devFlag = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  if (!devInfos || isEmpty(devInfos) || !devFlag) return null;

  return (
    <div className='flex flex-col gap-2'>
      <h2 className='text-sm font-medium'>{title || 'Dev Info'}</h2>

      {map(devInfos, ({ label, descriptor }) => {
        return (
          <div className='flex w-full justify-between' key={label}>
            <div className='text-sm'>{label}</div>

            {descriptor}
          </div>
        );
      })}
    </div>
  );
};

interface DevInfoProps {
  title?: string;
  devInfos: DevInfoUnit[];
}

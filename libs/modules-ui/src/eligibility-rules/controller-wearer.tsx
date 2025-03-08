'use client';

import { NULL_ADDRESSES } from '@hatsprotocol/constants';
import { useSelectedHat } from 'contexts';
import { getControllerNameAndLink } from 'hats-utils';
import { CodeIcon, EmptyWearer, WearerIcon } from 'icons';
import { includes, pick } from 'lodash';
import { IconType } from 'react-icons';
import { ControllerData } from 'types';
import { cn, Link, Tooltip } from 'ui';
import { formatAddress } from 'utils';

export const ControllerWearer = ({ controllerData }: { controllerData: ControllerData | undefined }) => {
  const { chainId } = useSelectedHat();
  const { id: address, isContract } = pick(controllerData, ['id', 'isContract', 'ensName']);

  const { name, link, icon } = getControllerNameAndLink({
    extendedController: controllerData,
    chainId,
  });

  if (includes(NULL_ADDRESSES, address)) {
    return (
      <div className='flex items-center gap-1 text-slate-600'>
        <p>Null</p>
        <EmptyWearer className='h-4 w-4' />
      </div>
    );
  }

  const Icon = icon ?? ((isContract ? CodeIcon : WearerIcon) as IconType);

  return (
    <Link href={link}>
      <Tooltip label={name !== formatAddress(address) ? address : undefined}>
        <div
          className={cn(
            'flex items-center gap-1',
            !isContract || name?.includes('Safe') ? 'text-informative-human' : 'text-informative-code',
          )}
        >
          <p>{name}</p>
          <Icon className='h-4 w-4' />
        </div>
      </Tooltip>
    </Link>
  );
};

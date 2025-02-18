'use client';
import { format } from 'date-fns';
import { useWearerDetails } from 'hats-hooks';
import { useClipboard } from 'hooks';
import { get, minBy, size, subtract, toLower } from 'lodash';
import { usePathname } from 'next/navigation';
import { createIcon } from 'opepen-standard';
import { useMemo } from 'react';
import { FiCopy } from 'react-icons/fi';
import { Button, OblongAvatar, Skeleton } from 'ui';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useEnsAvatar, useEnsName } from 'wagmi';

const WearerInfo = () => {
  const pathname = usePathname();
  const parsedPathname = pathname.split('/');
  const wearerAddress = get(parsedPathname, subtract(size(parsedPathname), 1)) as Hex;

  const { data: currentHats, isLoading: wearerLoading } = useWearerDetails({
    wearerAddress,
    chainId: 'all',
  });
  const { onCopy } = useClipboard(wearerAddress, {
    toastData: {
      title: 'Successfully copied wearer address to clipboard',
    },
  });

  const firstCreated = minBy(currentHats, 'createdAt');

  const { data: ensName } = useEnsName({
    address: wearerAddress,
    chainId: 1,
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName as string,
    chainId: 1,
  });

  const name = useMemo(() => {
    return ensName || formatAddress(wearerAddress);
  }, [ensName, wearerAddress]);

  const avatar = useMemo(() => {
    if (!wearerAddress || typeof window === 'undefined') return undefined;
    if (ensAvatar) return ensAvatar;
    return createIcon({
      seed: toLower(wearerAddress),
      size: 64,
    }).toDataURL();
  }, [wearerAddress, ensAvatar]);

  if (wearerLoading) {
    return (
      <div className='flex items-center gap-6 pl-6'>
        <Skeleton className='h-36 w-24 rounded-md' />

        <div className='flex flex-col gap-2'>
          <Skeleton className='h-6 w-24 rounded-md' />

          <Skeleton className='h-4 w-24 rounded-md' />
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-6 pl-6'>
      <OblongAvatar src={avatar} />

      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <p className='text-lg font-medium'>{name}</p>

          <Button variant='ghost' size='sm' onClick={onCopy} aria-label='Copy Address' color='gray.500'>
            <FiCopy />
          </Button>
        </div>

        {!!get(firstCreated, 'createdAt') && (
          <p>
            Hat wearer since:{' '}
            {get(firstCreated, 'createdAt') && format(Number(get(firstCreated, 'createdAt')) * 1000, 'MMMM yyyy')}
          </p>
        )}
      </div>
    </div>
  );
};

export { WearerInfo };

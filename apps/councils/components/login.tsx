'use client';

import { usePrivy } from '@privy-io/react-auth';
import { toLower } from 'lodash';
import { createIcon } from 'opepen-standard';
import { useMemo } from 'react';
import { Button, OblongAvatar, Popover, PopoverContent, PopoverTrigger, Skeleton } from 'ui';
import { chainsMap, formatAddress } from 'utils';
import { Hex } from 'viem';
import { useChainId, useEnsAvatar, useEnsName } from 'wagmi';

const Login = () => {
  const { ready, authenticated, login, logout, user, linkEmail, unlinkEmail } = usePrivy();
  // const { address } = useAccount();
  const chainId = useChainId();
  const { data: ensName } = useEnsName({ address: user?.wallet?.address ?? undefined, chainId: 1 });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName as string,
    chainId: 1,
  });

  const fallbackAvatar = useMemo(() => {
    if (!user || !user.wallet) return undefined;
    return createIcon({
      seed: toLower(user.wallet.address),
      size: 64,
    }).toDataURL();
  }, [user]);

  if (!ready) {
    return <Skeleton className='h-10 w-[100px] rounded-md md:w-[200px]' />;
  }

  if (!user || !authenticated || !user.wallet) {
    return (
      <Button onClick={login} variant='outline' className='h-10'>
        Login
      </Button>
    );
  }

  return (
    <div className='flex items-center gap-1'>
      <Button
        disabled
        className='h-10 w-10 rounded-md border border-gray-200 bg-white p-0 hover:bg-white disabled:cursor-default disabled:opacity-100'
      >
        {chainId && <img src={chainsMap(chainId)?.iconUrl} alt='Chain Icon' className='max-w-auto size-7' />}
      </Button>

      <Popover>
        <PopoverTrigger>
          <Button className='h-10 w-10 rounded-md border border-gray-200 bg-white px-3 hover:bg-gray-50'>
            <OblongAvatar src={ensAvatar || fallbackAvatar} className='h-8 w-6' />
          </Button>
        </PopoverTrigger>

        <PopoverContent className='border border-gray-200 bg-white'>
          <div className='p-4'>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-2'>
                <OblongAvatar src={ensAvatar || fallbackAvatar} className='h-10 w-8' />
                <p className='font-medium'>{ensName || formatAddress(user.wallet.address as Hex)}</p>
              </div>

              {user.email && (
                <div className='flex flex-col gap-2'>
                  <div className='flex items-center justify-between gap-1'>
                    <p className='text-xs text-gray-500'>Email</p>
                    <p className='text-sm'>{user.email.address}</p>
                  </div>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      unlinkEmail(user.email!.address);
                    }}
                  >
                    Unlink Email
                  </Button>
                </div>
              )}

              {!user.email ? (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => {
                    linkEmail();
                  }}
                >
                  Link Email
                </Button>
              ) : null}

              <Button size='sm' variant='destructive' onClick={logout}>
                Disconnect
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export { Login };

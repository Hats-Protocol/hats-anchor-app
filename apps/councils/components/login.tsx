'use client';

import { councilsChainsList } from '@hatsprotocol/config';
import { usePrivy } from '@privy-io/react-auth';
import { useToast } from 'hooks';
import { toLower } from 'lodash';
import { createIcon } from 'opepen-standard';
import { useMemo, useState } from 'react';
import { Button, cn, OblongAvatar, Popover, PopoverContent, PopoverTrigger, Skeleton } from 'ui';
import { chainsMap, formatAddress } from 'utils';
import { Hex } from 'viem';
import { useChainId, useEnsAvatar, useEnsName, useWalletClient } from 'wagmi';
import { useConfig } from 'wagmi';
import { switchChain } from 'wagmi/actions';

const Login = () => {
  const { ready, authenticated, login, logout, user, linkEmail, unlinkEmail } = usePrivy();
  const walletClient = useWalletClient();
  const chainId = useChainId();
  const config = useConfig();
  const { data: ensName } = useEnsName({ address: user?.wallet?.address ?? undefined, chainId: 1 });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName as string,
    chainId: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fallbackAvatar = useMemo(() => {
    if (!user || !user.wallet) return undefined;
    return createIcon({
      seed: toLower(user.wallet.address),
      size: 64,
    }).toDataURL();
  }, [user]);

  const { toast } = useToast();

  const handleNetworkSwitch = async (targetChainId: number) => {
    const currentChain = chainsMap(chainId)?.name ?? 'Unknown Chain';
    const targetChain = councilsChainsList[targetChainId as keyof typeof councilsChainsList]?.name ?? 'Unknown Chain';
    setIsLoading(true);
    try {
      toast({ title: `Switching from ${currentChain} to ${targetChain}...` });
      await switchChain(config, { chainId: targetChainId });
      toast({ title: `Successfully switched to ${targetChain}` });
    } catch (error: unknown) {
      console.error('Failed to switch network:', error);

      // Handle wallet errors based on error properties
      if (typeof error === 'object' && error !== null) {
        const walletError = error as { code?: number; message?: string };
        if (walletError.code === 4902) {
          toast({ title: `${targetChain} needs to be added to your wallet first` });
        } else if (walletError.message) {
          toast({ title: `Failed to switch to ${targetChain}: ${walletError.message}` });
        } else {
          toast({ title: `Failed to switch to ${targetChain}` });
        }
      } else {
        toast({ title: `Failed to switch to ${targetChain}` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready || isLoading) {
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
      <Popover>
        <PopoverTrigger asChild aria-label='Switch network'>
          <Button className='h-10 w-10 rounded-md border border-gray-200 bg-white p-0 hover:bg-white'>
            {chainId && (
              <img src={chainsMap(chainId)?.iconUrl} alt={chainsMap(chainId)?.name} className='max-w-auto size-7' />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[240px] border border-gray-200 bg-white p-0' role='menu' align='end'>
          <div className='p-1'>
            <p className='px-2 py-1.5 text-sm font-medium text-gray-500' id='network-list-title'>
              Switch Networks
            </p>
            <div className='flex flex-col gap-1'>
              {Object.entries(councilsChainsList).map(([id, chain]) => (
                <Button
                  key={id}
                  variant='ghost'
                  className={cn(
                    'flex w-full items-center justify-start gap-2 px-2 py-1.5',
                    Number(id) === chainId && 'bg-sky-100',
                  )}
                  role='menuitem'
                  onClick={() => handleNetworkSwitch(Number(id))}
                  aria-current={Number(id) === chainId ? 'true' : undefined}
                >
                  <img src={chain.iconUrl} alt={chain.name} className='size-6' />
                  <span className='text-sm font-medium'>{chain.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              'h-10 w-10 rounded-md border border-gray-200 bg-white px-3 hover:bg-gray-50',
              !walletClient && 'bg-functional-link-primary/20',
            )}
          >
            <OblongAvatar src={ensAvatar || fallbackAvatar} className='h-8 w-6' />
          </Button>
        </PopoverTrigger>

        <PopoverContent className='border border-gray-200 bg-white' align='end'>
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

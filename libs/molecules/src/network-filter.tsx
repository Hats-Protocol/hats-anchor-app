'use client';

import { NETWORK_IMAGES, ORDERED_CHAINS } from '@hatsprotocol/config';
import { SHOW_KEY } from '@hatsprotocol/constants';
import { map } from 'lodash';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FaFilter } from 'react-icons/fa';
import { SupportedChains } from 'types';
import { Button, cn, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from 'ui';
import { chainsMap, getPathParams } from 'utils';

const NetworkFilter = () => {
  const pathname = usePathname();
  const { chainId } = getPathParams(pathname);
  const params = useSearchParams();
  const showParam = params.get('show');

  const showKey = showParam === SHOW_KEY.all ? '?show=all' : '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button aria-label='Filter networks' className='border border-gray-500 bg-transparent p-2 hover:bg-black/10'>
          <div className='flex items-center gap-4'>
            <img src={NETWORK_IMAGES[chainId]} alt='chain' className='size-6' />
            <FaFilter className='size-4 text-black/80' />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className='space-y-2'>
          {map(ORDERED_CHAINS, (localChainId: number) => (
            <DropdownMenuItem disabled={localChainId === chainId} asChild key={localChainId}>
              <Link
                key={localChainId}
                href={`/trees/${localChainId}${showKey}`}
                className={cn(
                  'my-1 flex items-center justify-between',
                  localChainId === chainId ? 'bg-black/10 font-medium text-blue-500' : 'text-black',
                )}
              >
                <div className='flex items-center gap-4'>
                  <img
                    loading='lazy'
                    src={NETWORK_IMAGES[localChainId as SupportedChains]}
                    alt={chainsMap(localChainId)?.name}
                    className='mr-4 size-6'
                  />
                  <p>{chainsMap(localChainId)?.name}</p>
                </div>
                <p>{localChainId === chainId ? ' ✓' : ''}</p>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { NetworkFilter };

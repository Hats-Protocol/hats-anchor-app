'use client';

import { ORDERED_CHAINS } from '@hatsprotocol/config';
import { useWearerDetails } from 'hats-hooks';
import { useImageURIs, useMediaStyles } from 'hooks';
import { filter, get, groupBy, includes, isEmpty, keys, map, size, subtract } from 'lodash';
import { usePathname } from 'next/navigation';
import { AppHat, SupportedChains } from 'types';
import { Button, Link } from 'ui';
import { chainsMap } from 'utils';
import { Hex } from 'viem';

import { MobileHatCard, WearerHatCard as CoreHat } from '../cards';

const WearerHats = () => {
  const pathname = usePathname();
  const parsedPathname = pathname.split('/');
  const wearerAddress = get(parsedPathname, subtract(size(parsedPathname), 1)) as Hex;

  const { data: currentHats } = useWearerDetails({
    wearerAddress,
    chainId: 'all',
  });
  const { isMobile } = useMediaStyles();

  const { data: currentHatsWithImagesData } = useImageURIs({
    hats: currentHats,
  });

  const groupedHats = groupBy(currentHatsWithImagesData, 'chainId');
  const localOrderedChains = filter(ORDERED_CHAINS, (k: number) => includes(keys(groupedHats), String(k)));

  if (isEmpty(localOrderedChains)) {
    return (
      <div className='pt-100 flex w-full justify-center'>
        <div className='flex flex-col items-center gap-10'>
          <p className='text-xl font-medium'>Not wearing any hats</p>
          <div className='flex gap-2'>
            <Link href='/'>
              <Button variant='outline'>Home</Button>
            </Link>
            <Link href='/trees/new'>
              <Button>Create a new tree</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      {map(localOrderedChains, (chainId: SupportedChains) => (
        <div className='mt-4 flex flex-col gap-4' key={chainId}>
          <div className='flex border-b border-gray-400'>
            <p className='text-lg font-medium'>{chainsMap(Number(chainId)).name}</p>
          </div>

          <div className='grid grid-cols-1 gap-5 md:grid-cols-4'>
            {map(
              filter(currentHatsWithImagesData, {
                chainId: Number(chainId),
              }),
              (hat: AppHat) =>
                isMobile ? (
                  <MobileHatCard hat={hat} key={`${chainId}-${hat.id}`} chainId={chainId} />
                ) : (
                  <CoreHat hat={hat} key={`${chainId}-${hat.id}`} chainId={chainId} />
                ),
            )}
          </div>

          <div className='border-1 border-gray-400' />
        </div>
      ))}
    </div>
  );
};

export { WearerHats };

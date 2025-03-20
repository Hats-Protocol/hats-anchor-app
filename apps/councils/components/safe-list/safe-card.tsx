'use client';

import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { SafeInfoResponse } from '@safe-global/api-kit';
import { formHatUrl, safeUrl } from 'hats-utils';
import { get, toLower } from 'lodash';
import Link from 'next/link';
import { createIcon } from 'opepen-standard';
import { useMemo } from 'react';
import { AppHat, HatSignerGate, SupportedChains } from 'types';
import { Button, Card, Skeleton } from 'ui';
import { formatAddress, ipfsUrl } from 'utils';
import { useEnsAvatar, useEnsName } from 'wagmi';

import { ActiveStreams } from './active-streams';
import { LastTransaction } from './last-transaction';
import { SafeAssets } from './safe-assets';
import { SafeTotal } from './safe-total';
// import { SafeTransactions } from './safe-transactions';

const SafeCard = ({
  hats,
  signerSafe,
  safeInfo,
  chainId,
}: {
  hats: AppHat[] | undefined;
  signerSafe: HatSignerGate;
  safeInfo: SafeInfoResponse | undefined;
  chainId: number | undefined;
}) => {
  const safeAddress = get(signerSafe, 'safe');

  const firstHat = get(hats, '[0]');
  const firstHatDetails = get(firstHat, 'detailsMetadata');
  const firstHatName = firstHatDetails ? get(JSON.parse(firstHatDetails), 'data.name') : get(firstHat, 'details');
  const imageUrl = ipfsUrl(get(firstHat, 'nearestImage'));

  const { data: ensName } = useEnsName({
    address: safeAddress,
    chainId: 1,
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName as string,
    chainId: 1,
  });

  const safeAvatar: string | undefined = useMemo(() => {
    if (!safeAddress) return undefined;
    return createIcon({
      seed: toLower(safeAddress),
      size: 64,
    }).toDataURL();
  }, [safeAddress]);

  if (!firstHat || !chainId) return null;

  if (!get(signerSafe, 'safe')) {
    return <Skeleton className='h-full w-full' />;
  }

  return (
    <Card className='w-full'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex max-w-[80%] items-center gap-2'>
            <div
              className='h-[50px] w-[50px] overflow-hidden rounded-md border border-gray-400 bg-cover bg-clip-content bg-center'
              style={{ backgroundImage: imageUrl !== '#' ? imageUrl : '/icon.jpeg' }}
            />

            <h2 className='text-lg font-medium'>{firstHatName}</h2>
          </div>

          <SafeTotal safeAddress={safeAddress} />
        </div>

        <SafeAssets safeAddress={safeAddress} chainId={chainId} />

        <hr className='mx-auto w-[70%]' />

        <ActiveStreams safeAddress={safeAddress} />

        <div className='flex items-center justify-between'>
          <LastTransaction safeAddress={safeAddress} type={'inbound'} />

          <LastTransaction safeAddress={safeAddress} type={'outbound'} />
        </div>

        {/* <SafeTransactions safeAddress={safeAddress} /> */}

        <div className='flex items-center justify-between pt-4'>
          <Link href={safeUrl(chainId as SupportedChains, get(signerSafe, 'safe'))}>
            <Button variant='link' className='m-0 p-0'>
              <div className='flex items-center gap-2'>
                <div
                  className='h-[26px] w-[16px] overflow-hidden rounded-sm bg-cover bg-clip-content bg-center'
                  style={{
                    backgroundImage: ensAvatar || safeAvatar,
                  }}
                />
                <p className='size-sm font-normal'>{ensName || formatAddress(get(signerSafe, 'safe'))}</p>
              </div>
            </Button>
          </Link>

          <Link
            href={formHatUrl({
              chainId: chainId as SupportedChains,
              hatId: firstHat.id,
            })}
          >
            <Button variant='link' className='m-0 p-0'>
              <p className='size-sm font-normal'>#{hatIdDecimalToIp(hatIdHexToDecimal(firstHat.id))}</p>
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export { SafeCard };

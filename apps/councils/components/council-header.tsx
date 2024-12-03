'use client';

import { Button } from '@chakra-ui/react';
import { safeUrl } from 'hats-utils';
import { useCouncilDetails, useSafesInfo } from 'hooks';
import { capitalize, first, get, last, nth, size } from 'lodash';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Skeleton } from 'ui';
import { Hex } from 'viem';

const chainId = 11155111;

const handleHatDetails = (detailsMetadata: string | undefined) => {
  if (!detailsMetadata) return undefined;

  const parsedDetailsMetadata = JSON.parse(detailsMetadata);
  // only handling basic hat details for now
  return get(parsedDetailsMetadata, 'data');
};

export const CouncilHeader = () => {
  const pathname = usePathname();
  const slug = nth(pathname.split('/'), 2);
  const chain = first(slug?.split(':'));
  const address = last(slug?.split(':'));
  const { data: councilDetails } = useCouncilDetails({
    chainId,
    address,
  });
  const { data: safesDetails } = useSafesInfo({
    chainId,
    safes: [councilDetails?.safe as Hex],
  });
  const primarySignerHat = first(councilDetails?.signerHats);
  const signerHatDetails = handleHatDetails(
    get(primarySignerHat, 'detailsMetadata') as string | undefined,
  );
  const safe = first(safesDetails);

  if (!safe) {
    return (
      <div className='bg-slate-200 py-10'>
        <Skeleton className='mx-auto flex min-h-[100px] w-[90%] max-w-[1000px] rounded-lg p-4' />
      </div>
    );
  }

  return (
    <div className='bg-slate-200 py-10'>
      <div className='mx-auto flex w-[90%] max-w-[1000px] justify-between rounded-lg border border-black bg-slate-50 p-4'>
        <div className='flex w-[30%] flex-col gap-2'>
          <div>Back to Circle DAO councils</div>
          <h1 className='text-2xl font-bold'>
            {get(signerHatDetails, 'name')}
          </h1>
          <p className='truncate text-sm'>
            {get(signerHatDetails, 'description')}
          </p>
        </div>

        <div className='flex w-auto items-center'>
          <Link
            href={safeUrl(chainId, councilDetails?.safe as Hex)}
            target='_blank'
          >
            <Button>Safe Wallet</Button>
          </Link>
        </div>

        <div className='flex w-[30%] flex-col items-end justify-center gap-2'>
          <div>
            {get(safe, 'threshold')}/{size(get(safe, 'owners'))} Multisig
          </div>
          <div>on {capitalize(chain)}</div>
          <div>by Circle DAO</div>
        </div>
      </div>
    </div>
  );
};

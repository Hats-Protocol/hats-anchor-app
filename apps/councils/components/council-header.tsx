'use client';

import { Button, Icon } from '@chakra-ui/react';
import { safeUrl } from 'hats-utils';
import { useCouncilDetails, useSafesInfo } from 'hooks';
import { capitalize, first, get, nth, size } from 'lodash';
import { toNumber } from 'lodash';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { SupportedChains } from 'types';
import { Skeleton } from 'ui';
import { chainsMap, parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

import { SignersIndicator } from './signers-indicator';

const SafeIcon = dynamic(() => import('icons').then((mod) => mod.Safe), {
  ssr: false,
});

const handleHatDetails = (detailsMetadata: string | undefined) => {
  if (!detailsMetadata) return undefined;

  const parsedDetailsMetadata = JSON.parse(detailsMetadata);
  // only handling basic hat details for now
  return get(parsedDetailsMetadata, 'data');
};

export const CouncilHeader = () => {
  const pathname = usePathname();
  const slug = nth(pathname.split('/'), 2);
  const { chainId, address } = parseCouncilSlug(slug ?? '');

  const { data: councilDetails } = useCouncilDetails({
    chainId: chainId ?? 11155111,
    address,
  });
  const { data: safesDetails } = useSafesInfo({
    chainId: chainId ?? 11155111,
    safes: [councilDetails?.safe as unknown as Hex],
  });
  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const signerHatDetails = handleHatDetails(get(primarySignerHat, 'detailsMetadata') as string | undefined);
  const safe = first(safesDetails);

  // TODO check signers vs hat wearers
  // TODO better loading state/check
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
          <h1 className='text-2xl font-bold'>{get(signerHatDetails, 'name')}</h1>
          <p className='truncate text-sm'>{get(signerHatDetails, 'description')}</p>
        </div>

        <div className='flex w-auto items-center'>
          {size(get(primarySignerHat, 'wearers')) === toNumber(get(primarySignerHat, 'maxSupply')) ? (
            <Link
              href={safeUrl((chainId ?? 11155111) as SupportedChains, councilDetails?.safe as unknown as Hex)}
              target='_blank'
            >
              <Button
                variant='outline'
                leftIcon={<Icon as={SafeIcon} />}
                rightIcon={<Icon as={FaExternalLinkAlt} boxSize={3} />}
              >
                Safe Wallet
              </Button>
            </Link>
          ) : (
            <SignersIndicator
              threshold={toNumber(get(councilDetails, 'minThreshold'))}
              // TODO replace with safe signers instead of hat wearers
              signers={size(get(primarySignerHat, 'wearers'))}
              maxSigners={toNumber(get(primarySignerHat, 'maxSupply'))}
            />
          )}
        </div>

        <div className='flex w-[30%] flex-col items-end justify-center gap-2'>
          {size(get(primarySignerHat, 'wearers')) > toNumber(get(councilDetails, 'minThreshold')) ? (
            <div>
              {get(safe, 'threshold')}/{size(get(safe, 'owners'))} Multisig
            </div>
          ) : (
            <div>
              Pending {get(councilDetails, 'minThreshold')}/{get(primarySignerHat, 'maxSupply')} Multisig
            </div>
          )}

          <div>on {capitalize(chainsMap(chainId ?? 11155111)?.name)}</div>
          <div>by Circle DAO</div>
        </div>
      </div>
    </div>
  );
};

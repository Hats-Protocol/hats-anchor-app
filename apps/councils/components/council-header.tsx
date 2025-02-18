'use client';

import { hatIdDecimalToHex, hatIdHexToDecimal, hatIdToTreeId, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails } from 'hats-hooks';
import { safeUrl } from 'hats-utils';
import { useCouncilDetails, useOffchainCouncilDetails, useSafeDetails, useSafesInfo } from 'hooks';
import { capitalize, filter, first, get, includes, map, nth, size, toLower } from 'lodash';
import { toNumber } from 'lodash';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { createIcon } from 'opepen-standard';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { SupportedChains } from 'types';
import { Button, cn, Link, OblongAvatar, Skeleton } from 'ui';
import { chainsMap, explorerUrl, formatAddress, parseCouncilSlug } from 'utils';
import { Hex } from 'viem';
import { useEnsAvatar, useEnsName } from 'wagmi';

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

const CouncilHeaderCard = ({
  chainId,
  address,
  withLinks = true,
}: {
  chainId?: number;
  address?: string;
  withLinks?: boolean;
}) => {
  const { data: councilDetails } = useCouncilDetails({
    chainId: chainId ?? 11155111,
    address: address ?? '',
  });
  const { data: offchainCouncilDetails } = useOffchainCouncilDetails({
    hsg: address as Hex,
    chainId: chainId ?? 11155111,
  });
  const { data: safesDetails } = useSafesInfo({
    chainId: chainId ?? 11155111,
    safes: [councilDetails?.safe as unknown as Hex],
  });
  const { data: safeSignersRaw } = useSafeDetails({
    safeAddress: councilDetails?.safe as Hex,
    chainId: chainId ?? 11155111,
  });
  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const primarySignerHatId = get(primarySignerHat, 'id');
  const topHatId = !!primarySignerHatId
    ? treeIdToTopHatId(hatIdToTreeId(hatIdHexToDecimal(primarySignerHatId)))
    : undefined;
  const signerHatDetails = handleHatDetails(get(primarySignerHat, 'detailsMetadata') as string | undefined);
  const safe = first(safesDetails);
  const safeSigners = filter(safeSignersRaw, (signer) =>
    includes(map(primarySignerHat?.wearers, 'id'), toLower(signer)),
  );

  const { data: topHatDetails } = useHatDetails({
    chainId: (chainId ?? 11155111) as SupportedChains,
    hatId: topHatId ? hatIdDecimalToHex(topHatId) : undefined,
  });

  const topHatWearerAddress = get(topHatDetails, 'wearers[0].id');
  const { data: ensName } = useEnsName({
    address: topHatWearerAddress as Hex,
    chainId: 1,
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName as string,
    chainId: 1,
  });
  const fallbackAvatar = useMemo(() => {
    if (!topHatWearerAddress) return undefined;
    return createIcon({
      seed: topHatWearerAddress,
      size: 64,
    }).toDataURL();
  }, [topHatWearerAddress]);
  const topHatWearer = ensName || formatAddress(topHatWearerAddress);

  const offchainCouncilName = get(offchainCouncilDetails, 'creationForm.councilName');
  const offchainCouncilDescription = get(offchainCouncilDetails, 'creationForm.councilDescription');
  const organizationName = get(offchainCouncilDetails, 'organization.name');

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  // TODO check signers vs hat wearers
  // TODO better loading state/check
  if (!safe) {
    return <Skeleton className='bg-functional-link-primary/10 mx-auto flex min-h-[125px] w-full rounded-lg p-4' />;
  }

  return (
    <div
      className={cn(
        'flex justify-between rounded-2xl border border-black bg-gray-50 p-4 px-6',
        isDev && !offchainCouncilDetails && 'bg-blue-50',
      )}
    >
      <div className='flex w-[30%] flex-col gap-2'>
        <div className='text-functional-link-primary text-xs uppercase'>{organizationName}</div>
        <h1 className='text-2xl font-bold'>{offchainCouncilName || get(signerHatDetails, 'name')}</h1>
        <p className='truncate text-sm text-black/50'>
          {offchainCouncilDescription || get(signerHatDetails, 'description')}
        </p>
      </div>

      <div className='flex w-auto items-center'>
        {withLinks && size(safeSigners) >= toNumber(get(councilDetails, 'minThreshold')) ? (
          <Link
            href={safeUrl((chainId ?? 11155111) as SupportedChains, councilDetails?.safe as unknown as Hex)}
            isExternal
          >
            <Button variant='outline' rounded='full'>
              <SafeIcon className='size-3' />
              <p className='font-normal'>Safe Wallet</p>
              <FaExternalLinkAlt style={{ height: 14, width: 14 }} />
            </Button>
          </Link>
        ) : (
          <SignersIndicator
            threshold={toNumber(get(councilDetails, 'minThreshold'))}
            // TODO replace with safe signers instead of hat wearers
            signers={size(safeSigners)}
            maxSigners={toNumber(get(primarySignerHat, 'maxSupply'))}
          />
        )}
      </div>

      <div className='font-jb-mono flex w-[30%] flex-col items-end justify-center gap-2 text-sm'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center'>
            <div>
              {size(safeSigners) >= toNumber(get(councilDetails, 'minThreshold'))
                ? get(safe, 'threshold')
                : `Pending ${get(councilDetails, 'minThreshold')}`}
            </div>
            <div>
              {size(safeSigners) >= toNumber(get(councilDetails, 'minThreshold'))
                ? `/${size(safeSigners)}`
                : `/${get(primarySignerHat, 'maxSupply')}`}
            </div>
          </div>
          {withLinks ? (
            <Link
              className='flex items-center gap-2 text-black/80'
              href={safeUrl((chainId ?? 11155111) as SupportedChains, councilDetails?.safe as Hex)}
              isExternal
            >
              <div>Multisig</div>
              <SafeIcon className='size-4' />
            </Link>
          ) : (
            <div className='flex items-center gap-2'>
              <div>Multisig</div>
              <SafeIcon className='size-4' />
            </div>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <div>on {capitalize(chainsMap(chainId ?? 11155111)?.name)}</div>
          <img
            src={chainsMap(chainId ?? 11155111)?.iconUrl}
            className='size-4'
            alt={chainsMap(chainId ?? 11155111)?.name}
          />
        </div>

        <div className='flex items-center gap-2'>
          <div>by</div>
          {withLinks ? (
            <Link
              href={`${explorerUrl(chainId ?? 11155111)}/address/${topHatWearerAddress}`}
              className='flex items-center gap-2 text-black/80'
              isExternal
            >
              <div>{topHatWearer}</div>
              <OblongAvatar src={ensAvatar || fallbackAvatar} className='h-5 w-4 rounded-sm' />
            </Link>
          ) : (
            <div className='flex items-center gap-2'>
              <div>{topHatWearer}</div>
              <OblongAvatar src={ensAvatar || fallbackAvatar} className='h-5 w-4 rounded-sm' />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CouncilHeader = ({ chainId, address }: { chainId?: number; address?: string }) => {
  const pathname = usePathname();
  const slug = nth(pathname.split('/'), 2);
  const { chainId: slugChainId, address: slugAddress } = parseCouncilSlug(slug ?? '');
  const localChainId = chainId ?? slugChainId;
  const localAddress = address ?? slugAddress;

  return (
    <div className='border-b border-black bg-gray-200 px-6 pb-10 pt-4'>
      <CouncilHeaderCard chainId={localChainId || undefined} address={localAddress} />
    </div>
  );
};

export { CouncilHeader, CouncilHeaderCard };

'use client';

import { chainsList } from '@hatsprotocol/config';
import { usePrivy } from '@privy-io/react-auth';
import {
  useAuthGuard,
  useBatchOffchainCouncilDetails,
  useCrossChainAllowlist,
  useCrossChainWearer,
  useMediaStyles,
} from 'hooks';
import { concat, groupBy, isEmpty, map, orderBy, reject } from 'lodash';
import { CirclePlus } from 'lucide-react';
import { useMemo } from 'react';
import { HatSignerGateV2 } from 'types';
import { Button, HatDeco, Link } from 'ui';
import { chainIdToString, slugify } from 'utils';
import { NETWORKS_PREFIX } from 'utils/src/subgraph/mesh/queries/constants';
import { getAddress, Hex } from 'viem';
import { useAccount } from 'wagmi';

import { useCrossChainCouncilsList } from '../hooks';
import { AddCouncilButton } from './add-council-button';
import { CouncilHeaderCard } from './council-header';
import { CouncilHeaderSkeletons } from './council-header-skeletons';
import { EmptyCouncilSteps } from './empty-council-steps';

const CouncilListPageOrgs = () => {
  const { address: userAddress } = useAccount();
  const { ready: privyReady } = usePrivy();
  const { isClient } = useMediaStyles();
  const { isAuthorized, isReady, needsLogin } = useAuthGuard();

  // fetch user's hats across all chains
  const { data: crossChainWearerHats, isLoading: crossChainWearerHatsLoading } = useCrossChainWearer({
    wearerAddress: isAuthorized ? (userAddress as Hex) : undefined,
  });

  // fetch user's allowlist hats across all chains
  const { data: crossChainAllowlistHats, isLoading: crossChainAllowlistHatsLoading } = useCrossChainAllowlist({
    address: userAddress,
  });

  // breakdown wearer hats by network, only need ID for each hat
  const hatIdsByNetwork = Object.entries(crossChainWearerHats || {}).reduce(
    (acc, [key, value]) => {
      const prefix = key.split('_')[0];
      acc[prefix] = concat(
        value.currentHats?.map((hat) => hat.id) || [],
        map(crossChainAllowlistHats?.[prefix], 'hatId') || [],
      );
      return acc;
    },
    {} as Record<string, string[]>,
  );

  // use real councils data directly from all chains
  const { councilsList, isLoading: councilsLoading } = useCrossChainCouncilsList({
    hatIdsByNetwork,
  });
  console.log('cross-chain councils', crossChainWearerHats, crossChainAllowlistHats);

  // Create mapping from prefix to chain ID
  const prefixToChainId = useMemo(
    () =>
      Object.entries(NETWORKS_PREFIX).reduce(
        (acc, [chainId, prefix]) => {
          acc[prefix] = Number(chainId);
          return acc;
        },
        {} as Record<string, number>,
      ),
    [],
  );

  // Create a flat list of councils with their chain IDs
  const councilsWithChains = useMemo(
    () =>
      !isEmpty(councilsList)
        ? Object.entries(councilsList || {})
            .filter(([, councils]) => !isEmpty(councils))
            .flatMap(([key, councils]) => {
              const chainId = prefixToChainId[key];
              return (councils as HatSignerGateV2[]).map((council) => ({
                chainId,
                council,
                hsg: getAddress(council.id) as Hex,
              }));
            })
        : [],
    [councilsList, prefixToChainId],
  );

  // fetch all offchain details in batch -- uses parallel react queries instead of a promise.all -- we can consider optimizing this at the Mesh level instead
  const { data: offchainDetails, isLoading: offchainDetailsLoading } = useBatchOffchainCouncilDetails(
    councilsWithChains.map(({ hsg, chainId }) => ({ hsg, chainId })),
  );

  // combine council data with the offchain details
  const processedCouncils = useMemo(() => {
    const processedList = councilsWithChains.map((item, index) => ({
      ...item,
      offchainDetails: offchainDetails?.[index],
    }));

    return reject(processedList, (item) => !item.offchainDetails);
  }, [councilsWithChains, offchainDetails]);

  // show loading state until EVERYTHING is ready
  const isLoading =
    !isClient ||
    !isReady ||
    !privyReady ||
    !userAddress ||
    councilsLoading ||
    crossChainWearerHatsLoading ||
    crossChainAllowlistHatsLoading ||
    offchainDetailsLoading;

  // always show loading state first (avoids flash of empty state)
  if (isLoading) {
    return <CouncilHeaderSkeletons />;
  }

  // after loading, check auth first (only if we have a wallet address)
  // check for no data only after auth is confirmed
  if (needsLogin || isEmpty(councilsList)) {
    return <EmptyCouncilSteps />;
  }

  // TODO consolidate lookups from CouncilHeader here also
  if (!isEmpty(councilsList)) {
    // group councils by organization and chain
    const groupedCouncils = groupBy(processedCouncils, (item) => item.offchainDetails?.organization?.name || 'Other');

    // sort organizations alphabetically // TODO can we sort by chain first? (while we don't have multiple chains for the same org)
    const sortedOrgs = orderBy(Object.keys(groupedCouncils));

    return (
      <div className='mx-auto mt-8 flex min-h-screen max-w-[1400px] flex-col gap-6 px-2 md:mt-4 md:gap-8 md:px-10'>
        {sortedOrgs.map((organizationName) => (
          <div key={organizationName} className='flex flex-col gap-4'>
            {/* Group by chain within each organization */}
            {Object.entries(groupBy(groupedCouncils[organizationName], 'chainId')).map(([chainId, councils]) => {
              const chainConfig = chainsList[Number(chainId) as keyof typeof chainsList];
              console.log('councils', chainId, councils);
              return (
                <div key={chainId} className='flex flex-col gap-2 md:gap-4'>
                  <div className='flex flex-col justify-between gap-2 md:flex-row md:items-start md:gap-4'>
                    <div className='flex items-center gap-2'>
                      <img src={chainConfig?.iconUrl} alt={chainConfig?.name} className='size-6' />
                      <h3 className='text-xl font-bold'>{organizationName}</h3>
                    </div>
                    <div className='flex items-center gap-4'>
                      <AddCouncilButton organizationName={organizationName} />
                      <Link href={`/organizations/${slugify(organizationName)}`}>
                        <Button variant='outline-blue' className='w-fit rounded-full'>
                          View Organization
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className='flex flex-col gap-2 md:gap-4'>
                    {councils.map((item) => {
                      // const isMHSG = size(item.council?.signerHats) > 1;
                      console.log('list page', item);

                      return (
                        <Link
                          // href={`/councils/${chainIdToString(item.chainId)}:${getAddress(item.council.id)}/${isMHSG ? 'manage' : 'members'}`}
                          href={`/councils/${chainIdToString(item.chainId)}:${getAddress(item.council.id)}/members`}
                          className='hover:text-foreground/80 text-inherit hover:no-underline'
                          key={item.council.id}
                        >
                          <CouncilHeaderCard
                            chainId={item.chainId}
                            address={getAddress(item.council.id)}
                            withLinks={false}
                            initialCouncilDetails={item.council}
                            initialOffchainCouncilDetails={item.offchainDetails || undefined}
                            // initialSafeDetails={item.safeDetails || undefined}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div className='mt-2 flex justify-center'>
          <Link href='/councils/new'>
            <Button variant='outline-blue' className='w-fit rounded-full'>
              <CirclePlus className='text-functional-link-primary h-4 w-4' />
              Create a new Council
            </Button>
          </Link>
        </div>
        <HatDeco />
      </div>
    );
  }

  // fallback to loading state also
  return <CouncilHeaderSkeletons />;
};

export { CouncilListPageOrgs };

'use client';

import { chainsList } from '@hatsprotocol/config';
import { usePrivy } from '@privy-io/react-auth';
import {
  useAuthGuard,
  useBatchOffchainCouncilDetails,
  useCrossChainAllowlist,
  useCrossChainCouncilsList,
  useCrossChainWearer,
  useMediaStyles,
} from 'hooks';
import { flatten, groupBy, isEmpty, map, orderBy, uniq } from 'lodash';
import { ArrowRightCircle } from 'lucide-react';
import { useMemo } from 'react';
import { HatSignerGateV2 } from 'types';
import { Button, Card, HatDeco, Link, Popover, PopoverContent, PopoverTrigger, Skeleton } from 'ui';
import { chainIdToString, ipfsUrl, slugify } from 'utils';
import { NETWORKS_PREFIX } from 'utils/src/subgraph/mesh/queries/constants';
import { getAddress, Hex } from 'viem';
import { useAccount } from 'wagmi';

import { AddCouncilButton } from './add-council-button';
import { CouncilHeaderCard } from './council-header';

const EMPTY_COUNCIL_STEPS = [
  { title: 'Create a Council for your DAO' },
  { title: 'Share membership based access to a Safe Multisig' },
  { title: 'No code set up smart contracts control membership' },
  { title: 'Appoint trustworthy members & managers' },
  { title: 'Deploy and manage your council for only 0.1 ETH / month' },
];

const CouncilListPageOrgs = () => {
  const { address: userAddress } = useAccount();
  const { user, login } = usePrivy();
  const { isClient } = useMediaStyles();
  const { isAuthorized, isReady, needsLogin } = useAuthGuard();

  // fetch user's hats across all chains

  const { data: crossChainWearerHats, isLoading: crossChainWearerHatsLoading } = useCrossChainWearer({
    wearerAddress: isAuthorized ? (userAddress as Hex) : undefined,
  });

  // get all wearer hat IDs from each chain's currentHats array
  const wearerHatIds =
    !crossChainWearerHatsLoading && crossChainWearerHats
      ? flatten(
          Object.values(crossChainWearerHats)
            .filter(Boolean)
            .map((chainData) => (chainData as { currentHats?: { id: string }[] }).currentHats || []),
        ).map((hat) => hat.id)
      : [];

  const { data: crossChainAllowlistHats, isLoading: crossChainAllowlistHatsLoading } = useCrossChainAllowlist({
    address: userAddress,
  });

  // get all allowlist hat IDs from each chain's eligibilities array
  const allowlistHatIds =
    !crossChainAllowlistHatsLoading && crossChainAllowlistHats
      ? flatten(
          Object.entries(crossChainAllowlistHats || {})
            .filter(([key]) => key.endsWith('_allowListEligibilities'))
            .map(([_, chainData]) => chainData as string[]),
        )
      : [];

  // combine both arrays and ensure uniqueness
  const combinedHats =
    !crossChainWearerHatsLoading && !crossChainAllowlistHatsLoading ? uniq([...wearerHatIds, ...allowlistHatIds]) : [];

  // process hat IDs to ensure we only have strings since each response format is slightly different
  const processedHatIds = combinedHats.map((id: string | { hatId: string }) => {
    if (typeof id === 'string') return id as `0x${string}`;
    if (typeof id === 'object' && 'hatId' in id) return id.hatId as `0x${string}`;
    return id as `0x${string}`;
  });

  // use real councils data directly from all chains
  const { data: crossChainCouncils, isLoading: crossChainCouncilsLoading } = useCrossChainCouncilsList({
    hatIds: processedHatIds ?? [],
  });

  // Create mapping from prefix to chain ID
  const prefixToChainId = useMemo(
    () =>
      Object.entries(NETWORKS_PREFIX).reduce(
        (acc, [chainId, prefix]) => {
          acc[`${prefix}_hatsSignerGateV2S`] = Number(chainId);
          return acc;
        },
        {} as Record<string, number>,
      ),
    [],
  );

  // Create a flat list of councils with their chain IDs
  const councilsWithChains = useMemo(
    () =>
      !isEmpty(crossChainCouncils)
        ? Object.entries(crossChainCouncils || {})
            .filter(([_, councils]) => !isEmpty(councils))
            .flatMap(([key, councils]) => {
              const chainId = prefixToChainId[key];
              return (councils as HatSignerGateV2[]).map((council) => ({
                chainId,
                council,
                hsg: getAddress(council.id) as Hex,
              }));
            })
        : [],
    [crossChainCouncils, prefixToChainId],
  );

  // fetch all offchain details in batch -- uses parallel react queries instead of a promise.all -- we can consider optimizing this at the Mesh level instead
  const { data: offchainDetails, isLoading: offchainDetailsLoading } = useBatchOffchainCouncilDetails(
    councilsWithChains.map(({ hsg, chainId }) => ({ hsg, chainId })),
  );

  // combine council data with the offchain details
  const processedCouncils = useMemo(
    () =>
      councilsWithChains.map((item, index) => ({
        ...item,
        offchainDetails: offchainDetails?.[index],
      })),
    [councilsWithChains, offchainDetails],
  );

  // show loading state until EVERYTHING is ready
  const isLoading =
    !isClient ||
    !isReady ||
    !userAddress ||
    crossChainCouncilsLoading ||
    crossChainWearerHatsLoading ||
    crossChainAllowlistHatsLoading ||
    offchainDetailsLoading;

  // always show loading state first (avoids flash of empty state)
  if (isLoading) {
    return (
      <div className='mx-auto mt-6 flex max-w-[1400px] flex-col gap-4'>
        {map(Array(5), (_, index) => (
          <Skeleton key={index} className='bg-functional-link-primary/10 h-[125px] w-full' />
        ))}
      </div>
    );
  }

  // after loading, check auth first (only if we have a wallet address)
  if (needsLogin) {
    return (
      <div className='relative mx-auto mt-20 flex min-h-[85vh] max-w-[1000px] flex-col gap-4 px-4 md:px-0'>
        <Card className='z-10 mx-auto w-full space-y-8 bg-white/90 px-6 py-8 md:w-[750px] md:space-y-12 md:px-20 md:py-12'>
          <div className='text-2xl font-bold md:text-3xl'>
            Create and maintain subDAOs, councils, committees, and teams in 5 easy steps
          </div>

          <div className='space-y-4 md:space-y-6'>
            {map(EMPTY_COUNCIL_STEPS, (step, i) => (
              <div className='flex items-center gap-3 md:gap-4' key={step.title}>
                <div className='border-functional-link-primary/30 flex size-8 shrink-0 items-center justify-center rounded-full border text-center md:size-12'>
                  <p className='text-sm font-medium md:text-lg'>{i + 1}</p>
                </div>

                <p className='text-sm font-normal md:text-lg'>{step.title}</p>
              </div>
            ))}
          </div>

          <div className='flex justify-center'>
            {/* Desktop: Direct link */}
            <div className='hidden md:block'>
              <Link href={user ? '/councils/new' : '#'}>
                <Button
                  size='xl'
                  rounded='full'
                  onClick={!user ? () => login() : undefined}
                  className='bg-functional-link-primary'
                >
                  {user && !userAddress ? 'Create a Council' : 'Connect to create a Council'}
                  <ArrowRightCircle className='ml-1 !size-5 text-white' />
                </Button>
              </Link>
            </div>

            {/* Mobile: Popover for login */}
            <div className='md:hidden'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button size='lg' rounded='full' className='bg-functional-link-primary'>
                    Connect to create a Council
                    <ArrowRightCircle className='ml-1 !size-5 text-white' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-64 text-center' align='center'>
                  <p className='font-medium'>Connect Wallet</p>
                  <p className='mb-3 mt-1 text-sm text-gray-500'>Connect your wallet to create and manage councils.</p>
                  <Button
                    size='sm'
                    rounded='full'
                    className='bg-functional-link-primary w-full'
                    onClick={() => login()}
                  >
                    Connect Wallet
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Card>

        <img
          src={ipfsUrl('ipfs://bafybeiay3ysw4hffk62456srnt7m7ff55zoc7pzver4ndcyrxsidhdfjoq')}
          className='absolute bottom-0 right-0 z-0 aspect-square h-[400px] opacity-30 md:h-[700px] md:opacity-40'
        />
      </div>
    );
  }

  // check for no data only after auth is confirmed
  if (isEmpty(crossChainCouncils)) {
    return (
      <div className='relative mx-auto mt-20 flex min-h-[85vh] max-w-[1000px] flex-col gap-4 px-4 md:px-0'>
        <Card className='z-10 mx-auto w-full space-y-8 bg-white/90 px-6 py-8 md:w-[750px] md:space-y-12 md:px-20 md:py-12'>
          <div className='text-2xl font-bold md:text-3xl'>
            Create and maintain subDAOs, councils, committees, and teams in 5 easy steps
          </div>

          <div className='space-y-4 md:space-y-6'>
            {map(EMPTY_COUNCIL_STEPS, (step, i) => (
              <div className='flex items-center gap-3 md:gap-4' key={step.title}>
                <div className='border-functional-link-primary/30 flex size-8 shrink-0 items-center justify-center rounded-full border text-center md:size-12'>
                  <p className='text-sm font-medium md:text-lg'>{i + 1}</p>
                </div>

                <p className='text-sm font-normal md:text-lg'>{step.title}</p>
              </div>
            ))}
          </div>

          <div className='flex justify-center'>
            {/* Desktop: Direct link */}
            <div className='hidden md:block'>
              <Link href={user ? '/councils/new' : '#'}>
                <Button
                  size='xl'
                  rounded='full'
                  onClick={!user ? () => login() : undefined}
                  className='bg-functional-link-primary'
                >
                  {user && !userAddress ? 'Create a Council' : 'Connect to create a Council'}
                  <ArrowRightCircle className='ml-1 !size-5 text-white' />
                </Button>
              </Link>
            </div>

            {/* Mobile: Popover for login */}
            <div className='md:hidden'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button size='lg' rounded='full' className='bg-functional-link-primary'>
                    Connect to create a Council
                    <ArrowRightCircle className='ml-1 !size-5 text-white' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-64 text-center' align='center'>
                  <p className='font-medium'>Connect Wallet</p>
                  <p className='mb-3 mt-1 text-sm text-gray-500'>Connect your wallet to create and manage councils.</p>
                  <Button
                    size='sm'
                    rounded='full'
                    className='bg-functional-link-primary w-full'
                    onClick={() => login()}
                  >
                    Connect Wallet
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Card>

        <img
          src={ipfsUrl('ipfs://bafybeiay3ysw4hffk62456srnt7m7ff55zoc7pzver4ndcyrxsidhdfjoq')}
          className='absolute bottom-0 right-0 z-0 aspect-square h-[400px] opacity-30 md:h-[700px] md:opacity-40'
        />
      </div>
    );
  }

  // TODO consolidate lookups from CouncilHeader here also

  if (!isEmpty(crossChainCouncils)) {
    // group councils by organization and chain
    const groupedCouncils = groupBy(processedCouncils, (item) => item.offchainDetails?.organization?.name || 'Other');

    // sort organizations alphabetically
    const sortedOrgs = orderBy(Object.keys(groupedCouncils));

    return (
      <div className='mx-auto mt-8 flex min-h-screen max-w-[1400px] flex-col gap-6 px-2 md:mt-6 md:gap-8 md:px-10'>
        {sortedOrgs.map((organizationName) => (
          <div key={organizationName} className='flex flex-col gap-4'>
            {/* Group by chain within each organization */}
            {Object.entries(groupBy(groupedCouncils[organizationName], 'chainId')).map(([chainId, councils]) => {
              const chainConfig = chainsList[Number(chainId) as keyof typeof chainsList];
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
                    {councils.map((item) => (
                      <Link
                        href={`/councils/${chainIdToString(item.chainId)}:${getAddress(item.council.id)}/members`}
                        className='hover:text-foreground/80 text-inherit hover:no-underline'
                        key={item.council.id}
                      >
                        <CouncilHeaderCard
                          chainId={item.chainId}
                          address={getAddress(item.council.id)}
                          withLinks={false}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <HatDeco />
      </div>
    );
  }

  return (
    <div className='mx-auto mt-6 flex max-w-[1000px] flex-col gap-4'>
      {map(Array(5), (_, index) => (
        <Skeleton key={index} className='bg-functional-link-primary/10 h-[125px] w-full' />
      ))}
    </div>
  );
};

export { CouncilListPageOrgs };

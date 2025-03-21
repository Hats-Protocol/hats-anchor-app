'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { useWearerDetails } from 'hats-hooks';
import { useAuthGuard, useCouncilsList, useCrossChainAllowlist, useMediaStyles } from 'hooks';
import { concat, flatten, isEmpty, map, uniq } from 'lodash';
import { ArrowRightCircle } from 'lucide-react';
import { SupportedChains } from 'types';
import { Button, Card, HatDeco, Link, Popover, PopoverContent, PopoverTrigger, Skeleton } from 'ui';
import { chainIdToString, fetchAllowlistEntries, ipfsUrl, logger } from 'utils';
import { getAddress, Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import { CouncilHeaderCard } from './council-header';

const EMPTY_COUNCIL_STEPS = [
  {
    title: 'Create a Council for your DAO',
  },
  {
    title: 'Share membership based access to a Safe Multisig',
  },
  {
    title: 'No code set up smart contracts control membership',
  },
  {
    title: 'Appoint trustworthy members & managers',
  },
  {
    title: 'Deploy and manage your council for only 0.1 ETH / month',
  },
];

const CouncilListPage = () => {
  const { address: userAddress } = useAccount();
  const { user, login } = usePrivy();
  const chainId = useChainId();
  const { isClient } = useMediaStyles();
  const { isAuthorized, isReady, needsLogin } = useAuthGuard();

  // fetch user's hats
  const { data: wearerHats, isLoading: wearerHatsLoading } = useWearerDetails({
    wearerAddress: isAuthorized ? (userAddress as Hex) : undefined,
    chainId: 'all', // TODO migrate to all chains
  });
  logger.info('wearer hats', wearerHats);

  // fetch allowlists that the user has been added to
  const { data: allowlistHats, isLoading: allowlistHatsLoading } = useQuery({
    queryKey: ['allowlistHats', { userAddress, chainId }],
    queryFn: () => fetchAllowlistEntries(userAddress as Hex, chainId as SupportedChains),
    enabled: !!isAuthorized && !!userAddress,
  });

  const {
    data: crossChainAllowlistHats,
    isLoading: crossChainAllowlistHatsLoading,
    error: crossChainAllowlistHatsError,
  } = useCrossChainAllowlist({
    address: userAddress,
  });

  logger.info('crossChainAllowlistHats', crossChainAllowlistHats);

  logger.info('crosschainallowlisthats flattened', flatten(Object.values(crossChainAllowlistHats || {})), 'hatId');
  logger.info('allowList Hats', allowlistHats);
  const combinedHats =
    !wearerHatsLoading && !allowlistHatsLoading ? concat(map(wearerHats, 'id'), map(allowlistHats, 'hatId')) : null;

  logger.info(
    'uniq combined hats',
    uniq(combinedHats)?.map((id) => id as `0x${string}`),
  );

  // Use real councils data directly
  const { data: councils, isLoading: councilsLoading } = useCouncilsList({
    hatIds: uniq(combinedHats)?.map((id) => id as `0x${string}`) ?? [],
    chainId,
  });

  if (!isReady) {
    return (
      <div className='mx-auto mt-20 flex max-w-[1400px] flex-col gap-4'>
        {map(Array(5), (_, index) => (
          <Skeleton key={index} className='bg-functional-link-primary/10 h-[125px] w-full' />
        ))}
      </div>
    );
  }

  // TODO consolidate lookups from CouncilHeader here also

  logger.debug('wearerHats', wearerHats, 'councils', councils);

  // Show landing page if needs login or has no councils
  if (
    needsLogin ||
    (isClient && isEmpty(councils) && !councilsLoading && !wearerHatsLoading && !allowlistHatsLoading)
  ) {
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

  if (!isEmpty(councils) && !councilsLoading && !wearerHatsLoading) {
    return (
      <div className='mx-auto mt-8 flex min-h-screen max-w-[1400px] flex-col gap-2 px-2 md:mt-20 md:gap-4 md:px-10'>
        {map(councils, (council) => (
          <Link
            href={`/councils/${chainIdToString(chainId)}:${getAddress(council.id)}/members`}
            className='hover:text-foreground/80 text-inherit hover:no-underline'
            key={council.id}
          >
            <CouncilHeaderCard key={council.id} chainId={chainId} address={getAddress(council.id)} withLinks={false} />
          </Link>
        ))}

        <HatDeco />
      </div>
    );
  }

  return (
    <div className='mx-auto mt-20 flex max-w-[1000px] flex-col gap-4'>
      {map(Array(5), (_, index) => (
        <Skeleton key={index} className='bg-functional-link-primary/10 h-[125px] w-full' />
      ))}
    </div>
  );
};

export { CouncilListPage };

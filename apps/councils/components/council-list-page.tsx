'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { useWearerDetails } from 'hats-hooks';
import { useAuthGuard, useCouncilsList, useMediaStyles } from 'hooks';
import { concat, isEmpty, map, uniq } from 'lodash';
import { ArrowRightCircle } from 'lucide-react';
import { SupportedChains } from 'types';
import { Button, Card, HatDeco, Link, Skeleton } from 'ui';
import { chainIdToString, fetchAllowlistEntries, ipfsUrl } from 'utils';
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
  const { user, login, authenticated } = usePrivy();
  const chainId = useChainId();
  const { isClient } = useMediaStyles();
  const { isAuthorized, isReady } = useAuthGuard();

  console.log('CouncilListPage State:', {
    userAddress,
    user,
    authenticated,
    isAuthorized,
    isReady,
    hasPrivyWallet: !!user?.wallet,
    walletAddress: user?.wallet?.address,
  });

  // fetch user's hats
  const { data: wearerHats, isLoading: wearerHatsLoading } = useWearerDetails({
    wearerAddress: isAuthorized ? (userAddress as Hex) : undefined,
    chainId, // TODO migrate to all chains
  });

  // fetch allowlists that the user has been added to
  const { data: allowlistHats, isLoading: allowlistHatsLoading } = useQuery({
    queryKey: ['allowlistHats', { userAddress, chainId }],
    queryFn: () => fetchAllowlistEntries(userAddress as Hex, chainId as SupportedChains),
    enabled: !!isAuthorized && !!userAddress,
  });

  const combinedHats =
    !wearerHatsLoading && !allowlistHatsLoading ? concat(map(wearerHats, 'id'), map(allowlistHats, 'hatId')) : null;

  // fetch associated councils for the combined list of hats
  const { data: councils, isLoading: councilsLoading } = useCouncilsList({
    hatIds: uniq(combinedHats),
    chainId,
  });

  console.log('Render conditions:', {
    isLoading: !isReady,
    isLocked: authenticated && user && !userAddress,
    isLandingPage:
      !user || (isClient && isEmpty(councils) && !councilsLoading && !wearerHatsLoading && !allowlistHatsLoading),
  });

  if (!isReady) {
    return (
      <div className='mx-auto mt-20 flex max-w-[1000px] flex-col gap-4'>
        {map(Array(5), (_, index) => (
          <Skeleton key={index} className='bg-functional-link-primary/10 h-[125px] w-full' />
        ))}
      </div>
    );
  }

  // Handle locked wallet state - this needs to be checked before the landing page
  if (authenticated && user && !userAddress) {
    console.log('Showing locked wallet state');
    return (
      <div className='relative mx-auto mt-20 flex h-[85vh] max-w-[1000px] flex-col gap-4'>
        <Card className='z-10 mx-auto w-[750px] space-y-12 bg-white/90 px-20 py-12'>
          <div className='text-3xl font-bold'>Wallet Locked</div>
          <p className='text-lg'>Please unlock your MetaMask wallet to continue.</p>
          <Button size='xl' rounded='full' onClick={() => login()} className='bg-functional-link-primary'>
            Unlock Wallet
            <ArrowRightCircle className='ml-1 !size-5 text-white' />
          </Button>
        </Card>
      </div>
    );
  }

  // Show landing page only if no Privy session
  if (!user || (isClient && isEmpty(councils) && !councilsLoading && !wearerHatsLoading && !allowlistHatsLoading)) {
    return (
      <div className='relative mx-auto mt-20 flex h-[85vh] max-w-[1000px] flex-col gap-4'>
        <Card className='z-10 mx-auto w-[750px] space-y-12 bg-white/90 px-20 py-12'>
          <div className='text-3xl font-bold'>
            Create and maintain subDAOs, councils, committees, and teams in 5 easy steps
          </div>

          <div className='space-y-6'>
            {map(EMPTY_COUNCIL_STEPS, (step, i) => (
              <div className='flex items-center gap-4' key={step.title}>
                <div className='border-functional-link-primary/30 flex size-12 items-center justify-center rounded-full border'>
                  <p className='text-lg font-medium'>{i + 1}</p>
                </div>

                <p className='text-lg font-normal'>{step.title}</p>
              </div>
            ))}
          </div>

          <div>
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
        </Card>

        <img
          src={ipfsUrl('ipfs://bafybeiay3ysw4hffk62456srnt7m7ff55zoc7pzver4ndcyrxsidhdfjoq')}
          className='absolute bottom-0 right-0 z-0 aspect-square h-[700px] opacity-40'
        />
      </div>
    );
  }

  if (!isEmpty(councils) && !councilsLoading && !wearerHatsLoading) {
    return (
      <div className='mx-auto mt-20 flex min-h-screen max-w-[1400px] flex-col gap-4'>
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

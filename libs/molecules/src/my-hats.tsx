'use client';

import { CONFIG, ORDERED_CHAINS } from '@hatsprotocol/config';
import { useWearerDetails } from 'hats-hooks';
import { useMediaStyles } from 'hooks';
import { compact, filter, indexOf, isEmpty, map, sortBy } from 'lodash';
import { ReactNode, useMemo } from 'react';
import { BsDiagram3 } from 'react-icons/bs';
import { FaArrowRight } from 'react-icons/fa';
import { AppHat } from 'types';
import { Card, Link, LinkButton, Skeleton } from 'ui';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useEnsName } from 'wagmi';

import { DashboardHatCard } from './cards';

const HATS_TO_SHOW = 6;
const MOBILE_HATS_TO_SHOW = 3;

const MyHatsCard = ({
  name,
  hasHats,
  children,
}: {
  name: string | undefined;
  hasHats?: boolean;
  children: ReactNode;
}) => {
  return (
    <>
      <div className='flex flex-col justify-between gap-10 md:flex-row'>
        <div className='flex flex-col gap-2'>
          {!!name ? <p className='text-2xl font-medium'>gm {name} 👋</p> : <Skeleton className='h-10 w-32' />}

          {hasHats && <p className='text-lg'>Here&apos;s what&apos;s happening with your hats</p>}
        </div>

        <div className='hidden md:block'>
          <LinkButton href='/trees/new' size='lg' className='h-12' leftIcon={<BsDiagram3 className='h-4 w-4' />}>
            <p className='line-clamp-1 text-lg font-medium'>Create a new {CONFIG.TERMS.tree}</p>
          </LinkButton>
        </div>
      </div>

      {children}
    </>
  );
};

const MyHats = () => {
  const { address: currentUser } = useAccount();
  const { isMobile } = useMediaStyles();

  const { data: currentHats, isLoading: wearerDetailsLoading } = useWearerDetails({
    wearerAddress: currentUser as Hex,
    chainId: 'all',
  });

  const sortedActiveHats = useMemo(() => {
    const sortedHats = sortBy(compact(currentHats), (hat: AppHat) => {
      return indexOf(ORDERED_CHAINS, hat?.chainId);
    });
    const filtered = filter(sortedHats, { status: true });
    const sliced = filtered.slice(0, isMobile ? MOBILE_HATS_TO_SHOW : HATS_TO_SHOW);

    return { value: sliced || [], total: filtered.length };
  }, [currentHats, isMobile]);

  const { data: ensName } = useEnsName({ address: currentUser, chainId: 1 });

  if (!currentUser) {
    return (
      <div className='flex flex-col gap-2'>
        <h2 className='text-xl font-semibold'>
          Welcome to Hats Protocol!{' '}
          <span role='img' aria-label='Hats ball cap'>
            🧢
          </span>
        </h2>
        <p className='text-lg'>Please connect your wallet to get started.</p>
      </div>
    );
  }

  if (isEmpty(sortedActiveHats.value) && wearerDetailsLoading) {
    // hats loading
    return (
      <MyHatsCard name={ensName || formatAddress(currentUser)}>
        <Card className='bg-white/60 p-8'>
          <Skeleton className='mb-4 h-6' />

          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3'>
            {Array(isMobile ? MOBILE_HATS_TO_SHOW : HATS_TO_SHOW)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className='h-24 rounded-md' />
              ))}
          </div>
        </Card>
      </MyHatsCard>
    );
  }

  if (!isEmpty(sortedActiveHats.value)) {
    // some hats loaded
    return (
      <MyHatsCard name={ensName || formatAddress(currentUser)} hasHats={true}>
        <Card className='space-y-4 bg-white/60 p-8 shadow'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-semibold tracking-tight'>Your hats</h2>
            {sortedActiveHats.total > (isMobile ? MOBILE_HATS_TO_SHOW : HATS_TO_SHOW) && (
              <Link href={`/wearers/${currentUser}`}>
                <div className='flex items-center gap-2'>
                  <p>View {!isMobile ? 'all of ' : ''}your hats</p>
                  <FaArrowRight />
                </div>
              </Link>
            )}
          </div>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3'>
            {map(sortedActiveHats.value, (hat: AppHat, i: number) => (
              <DashboardHatCard hat={hat} key={i} />
            ))}
          </div>
        </Card>
      </MyHatsCard>
    );
  }

  // not loading and no hats found

  return (
    <MyHatsCard name={ensName || formatAddress(currentUser)}>
      <Card className='bg-white/60 p-8'>
        <div className='flex flex-col items-center justify-center'>
          <h2 className='text-xl font-semibold'>Your hats will appear here!</h2>

          <p>Create a tree or check out one of the featured trees.</p>
        </div>
      </Card>
    </MyHatsCard>
  );
};

export { MyHats };

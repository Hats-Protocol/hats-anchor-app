'use client';

import { Skeleton } from '@chakra-ui/react';
import { EligibilityContextProvider } from 'contexts';
import { useCouncilDetails } from 'hooks';
import { get } from 'lodash';
import dynamic from 'next/dynamic';
import { SupportedChains } from 'types';
import { Hex } from 'viem';

import { ModuleChainClaimsCard } from './module-chain-claim-card';
import ModuleChainClaimHeader from './module-chain-claim-header';

const HatDeco = dynamic(() => import('ui').then((mod) => mod.HatDeco));

export const ModuleChainClaim = ({ chainId, address }: { chainId: number | undefined; address: Hex | undefined }) => {
  const { data: councilDetails, isLoading } = useCouncilDetails({
    chainId,
    address,
  });
  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const hatId = get(primarySignerHat, 'id');

  // TODO better loading state
  if (isLoading) {
    return <Skeleton h='600px' w='800px' mx='auto' />;
  }

  if (!hatId) return null;

  return (
    <EligibilityContextProvider hatId={hatId} chainId={(chainId || undefined) as SupportedChains}>
      <div className='flex min-h-[600px] justify-center pt-10'>
        <div className='flex w-full max-w-screen-md flex-col gap-4'>
          <ModuleChainClaimHeader chainId={chainId || undefined} hsgAddress={address || undefined} />

          <ModuleChainClaimsCard />
        </div>
      </div>

      <HatDeco />
    </EligibilityContextProvider>
  );
};

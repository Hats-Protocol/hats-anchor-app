'use client';

import { EligibilityContextProvider } from 'contexts';
import { useAuthGuard, useCouncilDetails, useOffchainCouncilDetails } from 'hooks';
import { get } from 'lodash';
import { useMemo } from 'react';
import { SupportedChains } from 'types';
import { Skeleton } from 'ui';
import { Hex } from 'viem';

import { ModuleChainClaimsCard } from './module-chain-claim-card';
import { ModuleChainClaimHeader } from './module-chain-claim-header';

export const ModuleChainClaim = ({ chainId, address }: { chainId: number | undefined; address: Hex | undefined }) => {
  const { data: councilDetails, isLoading } = useCouncilDetails({
    chainId,
    address,
  });
  const { data: offchainCouncilDetails } = useOffchainCouncilDetails({
    chainId,
    hsg: address,
  });

  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const hatId = get(primarySignerHat, 'id');

  const labeledModules = useMemo(() => {
    if (!offchainCouncilDetails) return undefined;
    return {
      selection: get(offchainCouncilDetails, 'membersSelectionModule', '0x') as Hex,
      criteria: get(offchainCouncilDetails, 'membersCriteriaModule', '0x') as Hex,
    };
  }, [offchainCouncilDetails]);

  useAuthGuard();

  // TODO better loading state
  if (typeof window === 'undefined' || isLoading || !hatId) {
    return <Skeleton className='mx-auto h-[600px] w-full max-w-screen-lg' />;
  }

  return (
    <EligibilityContextProvider hatId={hatId} chainId={(chainId || undefined) as SupportedChains}>
      <div className='flex min-h-[600px] justify-center pt-10'>
        <div className='flex w-full max-w-screen-lg flex-col gap-4'>
          <ModuleChainClaimHeader
            chainId={chainId || undefined}
            hsgAddress={address || undefined}
            labeledModules={labeledModules}
            showJoinButton={true}
          />

          <ModuleChainClaimsCard labeledModules={labeledModules} />
        </div>
      </div>
    </EligibilityContextProvider>
  );
};

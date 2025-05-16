'use client';

import { EligibilityContextProvider } from 'contexts';
import { useAuthGuard, useCouncilDetails, useMediaStyles, useOffchainCouncilDetails } from 'hooks';
import { get } from 'lodash';
import { useMemo } from 'react';
import { SupportedChains } from 'types';
import { Skeleton } from 'ui';
import { getAddress, Hex } from 'viem';
import { useAccount } from 'wagmi';

import { EligibilityConditions } from '../claims-conditions/claims-conditions';
import { ModuleChainClaimsCard } from './module-chain-claim-card';
import { ModuleChainClaimHeader } from './module-chain-claim-header';

export const ModuleChainClaim = ({ chainId, address }: { chainId: number | undefined; address: Hex | undefined }) => {
  const { address: userAddress } = useAccount();
  const { isMobile } = useMediaStyles();
  const { isAuthorized } = useAuthGuard();

  const { data: councilDetails, isLoading } = useCouncilDetails({
    chainId,
    address,
  });

  useAuthGuard(); // Still included for login flow management

  const { data: offchainCouncilDetails } = useOffchainCouncilDetails({
    hsg: councilDetails?.id ? (getAddress(councilDetails?.id) as Hex) : undefined,
    chainId: chainId ?? 11155111,
    enabled: !!councilDetails?.id && !!chainId,
  });

  const labeledModules = useMemo(() => {
    if (!offchainCouncilDetails) return undefined;
    return {
      selection: get(offchainCouncilDetails, 'membersSelectionModule', '0x') as Hex,
      criteria: get(offchainCouncilDetails, 'membersCriteriaModule', '0x') as Hex,
    };
  }, [offchainCouncilDetails]);

  const hatId = useMemo(() => {
    if (!councilDetails?.signerHats?.length) return undefined;
    return get(councilDetails.signerHats[0], 'id');
  }, [councilDetails]);

  // Early return after all hooks and auth state check
  if (!isAuthorized || !userAddress) return null;

  if (typeof window === 'undefined' || isLoading || !hatId) {
    return <Skeleton className='mx-auto h-[600px] w-full max-w-screen-lg' />;
  }

  return (
    <EligibilityContextProvider hatId={hatId as Hex} chainId={chainId as SupportedChains}>
      <div className='flex min-h-[600px] justify-center pt-0 md:pt-10'>
        <div className='flex w-full max-w-screen-lg flex-col gap-0 md:gap-4'>
          <ModuleChainClaimHeader
            chainId={chainId}
            hsgAddress={address}
            labeledModules={labeledModules}
            showJoinButton={true}
          />
          {!isMobile && <ModuleChainClaimsCard labeledModules={labeledModules} />}
          {isMobile && <EligibilityConditions />}
        </div>
      </div>
    </EligibilityContextProvider>
  );
};

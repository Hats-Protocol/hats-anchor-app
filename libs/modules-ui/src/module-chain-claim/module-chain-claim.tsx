'use client';

import { EligibilityContextProvider } from 'contexts';
import { useAuthGuard, useCouncilDetails, useMediaStyles, useOffchainCouncilDetails } from 'hooks';
import { get } from 'lodash';
import { useMemo, useState } from 'react';
import { SupportedChains } from 'types';
import { Skeleton } from 'ui';
import { getAddress, Hex } from 'viem';
import { useAccount } from 'wagmi';

import { EligibilityConditions } from '../claims-conditions/claims-conditions';
import { ModuleChainClaimsCard } from './module-chain-claim-card';
import { ModuleChainClaimHeader } from './module-chain-claim-header';
import { MultiRoleSelector } from './multi-role-selector';

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

  const [selectedHatId, setSelectedHatId] = useState<Hex | undefined>(undefined);

  const hatId = useMemo(() => {
    if (!councilDetails?.signerHats?.length) return undefined;

    // For multi-role councils, use selected hat or default to first
    if (councilDetails.signerHats.length > 1) {
      return selectedHatId || get(councilDetails.signerHats[0], 'id');
    }

    // For single-role councils, use the only hat
    return get(councilDetails.signerHats[0], 'id');
  }, [councilDetails, selectedHatId]);

  const isMultiRole = useMemo(() => {
    return councilDetails?.signerHats && councilDetails.signerHats.length > 1;
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
          {isMultiRole && (
            <div className='mb-6'>
              <MultiRoleSelector
                signerHats={councilDetails?.signerHats || []}
                onRoleSelect={(hatId) => setSelectedHatId(hatId)}
                selectedHatId={selectedHatId}
              />
            </div>
          )}

          <ModuleChainClaimHeader
            chainId={chainId}
            hsgAddress={address}
            labeledModules={labeledModules}
            showJoinButton={true}
          />
          {!isMobile && <ModuleChainClaimsCard labeledModules={labeledModules} isMultiRole={isMultiRole} />}
          {isMobile && <EligibilityConditions />}
        </div>
      </div>
    </EligibilityContextProvider>
  );
};

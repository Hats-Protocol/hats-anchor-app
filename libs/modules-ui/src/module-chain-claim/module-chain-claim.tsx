'use client';

import { usePrivy } from '@privy-io/react-auth';
import { EligibilityContextProvider } from 'contexts';
import { useCouncilDetails, useOffchainCouncilDetails } from 'hooks';
import { get } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
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
  const { login, user, ready, isModalOpen, authenticated, linkEmail } = usePrivy();
  const hasTriggeredLogin = useRef(false);
  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const hatId = get(primarySignerHat, 'id');

  const labeledModules = useMemo(() => {
    if (!offchainCouncilDetails) return undefined;
    return {
      selection: get(offchainCouncilDetails, 'membersSelectionModule', '0x') as Hex,
      criteria: get(offchainCouncilDetails, 'membersCriteriaModule', '0x') as Hex,
    };
  }, [offchainCouncilDetails]);

  useEffect(() => {
    if (!ready) return;

    if (!isModalOpen && !authenticated) {
      hasTriggeredLogin.current = false;
    }

    const handleAuth = async () => {
      if (!authenticated && !hasTriggeredLogin.current) {
        hasTriggeredLogin.current = true;
        login();
        return;
      }

      // if (authenticated && !user?.email && !hasTriggeredEmailLink.current) {
      //   hasTriggeredEmailLink.current = true;
      //   linkEmail();
      //   return;
      // }

      // if (authenticated && user?.email) {
      //   router.push('/councils/new');
      // }
    };

    handleAuth();
  }, [ready, authenticated, user?.email, login, linkEmail, isModalOpen]);

  // TODO better loading state
  if (isLoading) {
    return <Skeleton className='mx-auto h-[600px] w-[800px]' />;
  }

  if (!hatId) return null;

  return (
    <EligibilityContextProvider hatId={hatId} chainId={(chainId || undefined) as SupportedChains}>
      <div className='flex min-h-[600px] justify-center pt-10'>
        <div className='flex w-full max-w-screen-md flex-col gap-4'>
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

'use client';

import { Skeleton } from '@chakra-ui/react';
import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { EligibilityContextProvider } from 'contexts';
import { useCouncilDetails } from 'hooks';
import { get, includes, keys } from 'lodash';
import dynamic from 'next/dynamic';
import { ComponentType, useState } from 'react';
import { ModuleDetails, SupportedChains } from 'types';
import { getKnownEligibilityModule } from 'utils';
import { Hex } from 'viem';

import ModuleChainClaimHeader from './module-chain-claim-header';

const AgreementClaims = dynamic(() =>
  import('modules-ui').then((mod) => mod.AgreementClaims),
);
const AllowlistClaims = dynamic(() =>
  import('modules-ui').then((mod) => mod.AllowlistClaims),
);
const HatDeco = dynamic(() => import('ui').then((mod) => mod.HatDeco));
// const ElectionClaims = dynamic(() =>
//   import('modules-ui').then((mod) => mod.ElectionClaims),
// );
// const SubscriptionClaims = dynamic(() =>
//   import('modules-ui').then((mod) => mod.SubscriptionClaims),
// );

const MODULE_CLAIMS_CARD: {
  [key: string]: ComponentType<{ activeModule: ModuleDetails }>;
} = {
  agreement: AgreementClaims,
  allowlist: AllowlistClaims,
  // election: ElectionClaims,
  // subscription: SubscriptionClaims,
};

const ModuleClaims = ({
  moduleDetails,
}: {
  moduleDetails: ModuleDetails | undefined;
}) => {
  if (!moduleDetails) return null;

  const knownModule = getKnownEligibilityModule(
    moduleDetails.implementationAddress as Hex,
  );

  if (!includes(keys(MODULE_CLAIMS_CARD), knownModule)) {
    // eslint-disable-next-line no-console
    console.log(
      'unknown module implementation',
      moduleDetails.implementationAddress,
      moduleDetails.name,
    );
    return <div>Unknown module</div>;
  }
  if (!knownModule) return null;

  const ModuleClaimsCard = get(MODULE_CLAIMS_CARD, knownModule);
  if (!ModuleClaimsCard) return null;

  return <ModuleClaimsCard activeModule={moduleDetails} />;
};

export const ModuleChainClaim = ({
  chainId,
  address,
}: {
  chainId: number | undefined;
  address: Hex | undefined;
}) => {
  const [activeRule, setActiveRule] = useState<{
    module: Module;
    address: `0x${string}`;
    liveParams?: ModuleParameter[] | undefined;
  }>();
  const { data: councilDetails, isLoading } = useCouncilDetails({
    chainId,
    address,
  });
  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const hatId = get(primarySignerHat, 'id');

  if (isLoading) {
    return <Skeleton h='600px' w='800px' mx='auto' />;
  }

  if (!hatId || !activeRule) return null;

  return (
    <EligibilityContextProvider
      hatId={hatId}
      chainId={(chainId || undefined) as SupportedChains}
    >
      <div className='flex min-h-[600px] justify-center pt-10'>
        <div className='flex w-full max-w-screen-md flex-col gap-4'>
          <ModuleChainClaimHeader
            activeRule={activeRule}
            setActiveRule={setActiveRule}
            chainId={chainId || undefined}
          />

          <ModuleClaims
            moduleDetails={{
              ...activeRule.module,
              id: activeRule?.module.id as Hex,
              version: activeRule?.module.version as string,
              instanceAddress: activeRule?.address,
              liveParameters: activeRule?.liveParams,
            }}
          />
        </div>
      </div>

      <HatDeco />
    </EligibilityContextProvider>
  );
};

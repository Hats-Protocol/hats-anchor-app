'use client';

import { CONFIG } from '@hatsprotocol/config';
import { FALLBACK_ADDRESS, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import { first, flatten, get, size } from 'lodash';
import { useModuleDetails } from 'modules-hooks';
import {
  AgreementClaims,
  ElectionClaims,
  ModuleChainClaimButtons,
  ModuleChainClaimsCard,
  SlimModuleDetails,
  SubscriptionClaims,
} from 'modules-ui';
import { Card, Link, Skeleton } from 'ui';
import { chainsMap, eligibilityRuleToModuleDetails, hatLink } from 'utils';

const Claims = () => {
  const { isClient } = useMediaStyles();
  const {
    chainId,
    selectedHat,
    eligibilityRules: rawEligibilityRules,
    isHatDetailsLoading,
    isEligibilityRulesLoading,
  } = useEligibility();
  const communityHat = chainId === 10 && get(selectedHat, 'id') === CONFIG.agreementV0.communityHatId;

  const eligibilityRules = flatten(rawEligibilityRules);
  const activeModule = eligibilityRuleToModuleDetails(first(eligibilityRules));

  const { details, parameters } = useModuleDetails({
    chainId,
    address: get(selectedHat, 'eligibility'),
  });

  if (selectedHat?.eligibility === FALLBACK_ADDRESS) {
    return (
      <div className='flex h-[500px] items-center justify-center'>
        <p>No eligibility conditions found for this {CONFIG.TERMS.hat}</p>
      </div>
    );
  }

  if (
    !isClient ||
    isEligibilityRulesLoading ||
    isHatDetailsLoading ||
    !selectedHat?.id ||
    (!activeModule && !communityHat)
  ) {
    return <Skeleton className='h-[500px] w-full rounded-lg' />;
  }

  if (size(eligibilityRules) > 1) {
    return (
      <div className='flex flex-col gap-4'>
        <ModuleChainClaimButtons showJoinButton={false} />
        <ModuleChainClaimsCard />
      </div>
    );
  }

  if (communityHat || activeModule?.name.includes('Agreement')) {
    return (
      <AgreementClaims
        activeModule={
          activeModule || {
            ...details!,
            instanceAddress: get(selectedHat, 'eligibility'),
            liveParameters: parameters,
          }
        }
      />
    );
  }

  // handle specific modules found
  // TODO migrate to ID and KNOWN_ELIGIBILITY_MODULES
  if (activeModule?.name === 'Hats Election Eligibility') return <ElectionClaims />;
  if (activeModule?.name.includes('Unlock Protocol')) return <SubscriptionClaims />;

  // fallback for other known modules
  if (activeModule) return <SlimModuleDetails type='eligibility' />;

  // fallback for unknown modules
  return (
    <Card>
      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-bold'>No compatible module found</h2>

        <p>
          No compatible module found for hat{' '}
          <Link href={hatLink({ chainId, hatId: selectedHat?.id })} className='decoration'>
            #{hatIdDecimalToIp(BigInt(selectedHat?.id))}
          </Link>{' '}
          on {chainsMap(chainId)?.name}
        </p>
      </div>
    </Card>
  );
};

export { Claims };

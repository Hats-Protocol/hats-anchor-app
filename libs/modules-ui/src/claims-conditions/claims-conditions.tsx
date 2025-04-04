'use client';

import { CONFIG } from '@hatsprotocol/config';
import { NULL_ADDRESSES } from '@hatsprotocol/constants';
import { useEligibility } from 'contexts';
import { first, flatten, gt, includes, pick, size } from 'lodash';
import { cn, Skeleton } from 'ui';
import { eligibilityRuleToModuleDetails, logger } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { CommunityHatEligibilityRule } from '../agreement';
import { ChainPanel, ControllerWearer, KnownEligibilityModule } from '../eligibility-rules';
import { ClaimButton } from './claim-button';

const IS_CLAIMS_APP = process.env.NEXT_PUBLIC_CLAIMS_APP === 'true';

// relies on different context from Controllers/Eligibility
const MODAL_SUFFIX = 'Claims';
const OVERRIDE_COMMUNITY_HAT = true;

export const EligibilityConditions = () => {
  const { address } = useAccount();
  const {
    selectedHat,
    chainId,
    eligibilityRules,
    isReadyToClaim,
    setIsReadyToClaim,
    isEligibilityRulesLoading,
    currentEligibility,
  } = useEligibility();

  const { eligibility } = pick(selectedHat, ['eligibility']);
  const eligibilityData = { id: eligibility as Hex };

  const multipleModules = gt(size(flatten(eligibilityRules)), 1);

  logger.debug('claims conditions', IS_CLAIMS_APP);

  if (multipleModules) {
    return (
      <ChainPanel
        ruleSets={eligibilityRules || undefined}
        chainId={chainId}
        selectedHat={selectedHat || undefined}
        modalSuffix={MODAL_SUFFIX}
        isReadyToClaim={isReadyToClaim}
        setIsReadyToClaim={setIsReadyToClaim}
        currentEligibility={currentEligibility}
        defaultOpen
      />
    );
  }

  if (OVERRIDE_COMMUNITY_HAT && selectedHat?.id === CONFIG.agreementV0.communityHatId) {
    return (
      <CommunityHatEligibilityRule
        selectedHat={selectedHat}
        wearer={address as Hex}
        chainId={chainId}
        isReadyToClaim={isReadyToClaim}
        setIsReadyToClaim={setIsReadyToClaim}
        modalSuffix={MODAL_SUFFIX}
      />
    );
  }

  if (eligibilityRules) {
    const moduleDetails = eligibilityRuleToModuleDetails(first(flatten(eligibilityRules))); // can assume there's only one rule

    return (
      <KnownEligibilityModule
        moduleDetails={moduleDetails}
        moduleParameters={moduleDetails?.liveParameters}
        selectedHat={selectedHat || undefined}
        wearer={address as Hex}
        chainId={chainId}
        modalSuffix={MODAL_SUFFIX}
        isReadyToClaim={isReadyToClaim}
        setIsReadyToClaim={setIsReadyToClaim}
        wearerEligibility={currentEligibility}
        ruleSets={eligibilityRules}
      />
    );
  }

  if (isEligibilityRulesLoading) {
    return <Skeleton className='mx-4 my-2 md:mx-0' />;
  }

  return (
    <div className='flex justify-between'>
      <p>{includes(NULL_ADDRESSES, eligibility) ? 'No addresses' : 'One address'} can remove Wearers</p>

      <ControllerWearer controllerData={eligibilityData} />
    </div>
  );
};

export const ClaimsConditions = () => {
  // TODO only include modals that are relevant
  const { isHatDetailsLoading, isEligibilityRulesLoading, eligibilityRules } = useEligibility();
  const multipleModules = gt(size(flatten(eligibilityRules)), 1);

  if (isHatDetailsLoading || isEligibilityRulesLoading) {
    return (
      <div className='w-full pb-20 md:pb-0'>
        <Skeleton className='mx-4 my-2 md:mx-0' />

        <Skeleton className='w-full' />

        <Skeleton className='mt-4 w-full' />
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col gap-4 pb-20 md:pb-0'>
      <div className={cn('flex flex-col gap-2')}>
        <h3 className={cn('text-sm', IS_CLAIMS_APP && 'px-4 md:px-0')}>Conditions to hold this {CONFIG.TERMS.hat}</h3>

        <div className={cn(IS_CLAIMS_APP && !multipleModules && 'px-4 md:px-0')}>
          <EligibilityConditions />
        </div>
      </div>

      <div className='hidden justify-center md:flex'>
        <ClaimButton />
      </div>
    </div>
  );
};

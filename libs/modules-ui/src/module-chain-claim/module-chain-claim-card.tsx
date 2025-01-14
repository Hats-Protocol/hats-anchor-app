'use client';

import { useEligibility } from 'contexts';
import { get, includes, keys } from 'lodash';
import { ComponentType } from 'react';
import { ModuleDetails } from 'types';
import { eligibilityRuleToModuleDetails, getKnownEligibilityModule } from 'utils';
import { Hex } from 'viem';

import { AgreementClaims } from '../agreement';
import { AllowlistClaims } from '../allowlist';
import { ElectionClaims } from '../election';
import { SubscriptionClaims } from '../subscription';

const MODULE_CLAIMS_CARD: {
  [key: string]: ComponentType<{ activeModule: ModuleDetails }>;
} = {
  agreement: AgreementClaims,
  allowlist: AllowlistClaims,
  election: ElectionClaims,
  unlock: SubscriptionClaims,
};

export const ModuleChainClaimsCard = () => {
  const { activeRule } = useEligibility();
  const moduleDetails = eligibilityRuleToModuleDetails(activeRule);
  // TODO handle loading
  if (!moduleDetails) return null;

  const knownModule = getKnownEligibilityModule(moduleDetails.implementationAddress as Hex);

  if (!includes(keys(MODULE_CLAIMS_CARD), knownModule)) {
    // eslint-disable-next-line no-console
    console.log('unknown module implementation', moduleDetails.implementationAddress, moduleDetails.name);
    return <div>Unknown module</div>;
  }
  if (!knownModule) return null;

  const ModuleClaimsCard = get(MODULE_CLAIMS_CARD, knownModule);
  if (!ModuleClaimsCard) return null;

  return <ModuleClaimsCard activeModule={moduleDetails} />;
};

'use client';

import { useEligibility } from 'contexts';
import { get, includes, keys } from 'lodash';
import { ComponentType } from 'react';
import { LabeledModules, ModuleDetails } from 'types';
import { eligibilityRuleToModuleDetails, getKnownEligibilityModule } from 'utils';
import { Hex } from 'viem';

import { AgreementClaims } from '../agreement';
import { AllowlistClaims } from '../allowlist';
import { ElectionClaims } from '../election';
import { Erc20Claims } from '../erc';
import { HatWearingEligibilityClaims } from '../hat-wearing';
import { SubscriptionClaims } from '../subscription';

const MODULE_CLAIMS_CARD: {
  [key: string]: ComponentType<{
    activeModule: ModuleDetails;
    labeledModules: LabeledModules | undefined;
    isMultiRole?: boolean;
  }>;
} = {
  agreement: AgreementClaims,
  allowlist: AllowlistClaims,
  election: ElectionClaims,
  hatWearing: HatWearingEligibilityClaims,
  unlock: SubscriptionClaims,
  erc20: Erc20Claims,
};

export const ModuleChainClaimsCard = ({
  labeledModules,
  isMultiRole = false,
}: {
  labeledModules?: LabeledModules | undefined;
  isMultiRole?: boolean;
}) => {
  const { activeRule } = useEligibility();
  const moduleDetails = eligibilityRuleToModuleDetails(activeRule);
  // TODO handle loading
  if (!moduleDetails) return null;

  const knownModule = getKnownEligibilityModule(moduleDetails.implementationAddress as Hex);

  // If the module is not recognized at all, return null
  if (!knownModule) return null;

  // If the module is recognized but doesn't have a specific claim component, show a generic message
  if (!includes(keys(MODULE_CLAIMS_CARD), knownModule)) {
    // eslint-disable-next-line no-console
    console.log('MODULE CLAIMS DEBUG:', {
      implementationAddress: moduleDetails.implementationAddress,
      moduleName: moduleDetails.name,
      knownModule,
      availableClaimsModules: keys(MODULE_CLAIMS_CARD),
      isKnownModuleInClaims: includes(keys(MODULE_CLAIMS_CARD), knownModule),
    });
    return (
      <div className='rounded-lg border bg-gray-50 p-4'>
        <h4 className='mb-2 font-medium'>{moduleDetails.name || `${knownModule} module`}</h4>
        <p className='text-sm text-gray-600'>
          This module is recognized but doesn&apos;t have a specific claims interface yet.
        </p>
        <p className='mt-1 text-sm text-gray-500'>Module type: {knownModule}</p>
      </div>
    );
  }

  const ModuleClaimsCard = get(MODULE_CLAIMS_CARD, knownModule);
  if (!ModuleClaimsCard) return null;

  // Pass additional props to specific claims components when they're selected
  if (knownModule === 'allowlist' || knownModule === 'hatWearing') {
    return <ModuleClaimsCard activeModule={moduleDetails} labeledModules={labeledModules} isMultiRole={isMultiRole} />;
  }

  return <ModuleClaimsCard activeModule={moduleDetails} labeledModules={labeledModules} />;
};

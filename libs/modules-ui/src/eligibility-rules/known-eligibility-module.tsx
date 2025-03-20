'use client';

import { ModuleParameter, Ruleset } from '@hatsprotocol/modules-sdk';
import { has } from 'lodash';
import { ReactNode } from 'react';
import { AppHat, ModuleDetails, SupportedChains } from 'types';
import { getKnownEligibilityModule } from 'utils';
import { Hex } from 'viem';

import { AgreementEligibilityRule } from '../agreement';
import { AllowlistEligibilityRule } from '../allowlist';
import { ElectionEligibilityRule } from '../election';
import { Erc20EligibilityRule } from '../erc';
import { Erc721EligibilityRule } from '../erc';
import { Erc1155EligibilityRule } from '../erc';
import { PassthroughModuleRule } from '../hat-controlled';
import { HatWearingEligibilityRule } from '../hat-wearing';
import { JokeRaceEligibilityRule } from '../joke-race';
import { StakingEligibilityRule } from '../staking';
import { UnlockEligibilityRule } from '../subscription';
import { UnknownEligibilityRule } from './unknown-eligibility';

type WearerEligibility = { [key: Hex]: { eligible: boolean; goodStanding: boolean } };

interface KnownEligibilityModuleParameters {
  moduleDetails: ModuleDetails | undefined;
  moduleParameters: ModuleParameter[] | undefined;
  selectedHat: AppHat | undefined;
  wearer: Hex | undefined;
  chainId: SupportedChains | undefined;
  modalSuffix?: string | undefined;
  isReadyToClaim?: { [key: Hex]: boolean };
  setIsReadyToClaim?: (address: Hex) => void;
  wearerEligibility: WearerEligibility | undefined;
  ruleSets: Ruleset[] | undefined;
}

export type EligibilityRuleComponent = ({
  selectedHat,
  moduleDetails,
  moduleParameters,
  wearer,
  chainId,
  modalSuffix,
  isReadyToClaim,
  setIsReadyToClaim,
  ruleSets,
}: KnownEligibilityModuleParameters) => ReactNode | undefined;

export const EligibilityModuleRules: {
  [key: string]: EligibilityRuleComponent;
} = {
  agreement: AgreementEligibilityRule,
  allowlist: AllowlistEligibilityRule,
  election: ElectionEligibilityRule,
  erc1155: Erc1155EligibilityRule,
  erc20: Erc20EligibilityRule,
  erc721: Erc721EligibilityRule,
  hatWearing: HatWearingEligibilityRule,
  jokeRace: JokeRaceEligibilityRule,
  passthrough: PassthroughModuleRule,
  staking: StakingEligibilityRule,
  unlock: UnlockEligibilityRule,
};

export const KnownEligibilityModule = ({
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
  selectedHat,
  modalSuffix,
  isReadyToClaim,
  setIsReadyToClaim,
  wearerEligibility,
  ruleSets,
}: KnownEligibilityModuleParameters) => {
  // if no module details or implementation address, show unknown rule
  if (!moduleDetails?.implementationAddress) {
    return <UnknownEligibilityRule chainId={chainId} wearer={wearer} selectedHat={selectedHat} />;
  }

  // get the module key and validate it exists
  const moduleKey = getKnownEligibilityModule(moduleDetails.implementationAddress as Hex);
  if (!moduleKey || !has(EligibilityModuleRules, moduleKey)) {
    return <UnknownEligibilityRule chainId={chainId} wearer={wearer} selectedHat={selectedHat} />;
  }

  // get the rule component
  const RuleComponent = EligibilityModuleRules[moduleKey];

  // render the rule as a component with all props available
  return (
    <RuleComponent
      selectedHat={selectedHat}
      moduleDetails={moduleDetails}
      moduleParameters={moduleParameters}
      wearer={wearer}
      chainId={chainId}
      modalSuffix={modalSuffix}
      isReadyToClaim={isReadyToClaim}
      setIsReadyToClaim={setIsReadyToClaim}
      wearerEligibility={wearerEligibility}
      ruleSets={ruleSets}
    />
  );
};

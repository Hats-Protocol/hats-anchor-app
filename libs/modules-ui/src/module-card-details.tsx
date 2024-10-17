import { KNOWN_ELIGIBILITY_MODULES } from '@hatsprotocol/constants';
import { find, has, keys } from 'lodash';
import {
  AppHat,
  ModuleDetails,
  ModuleDetailsComponent,
  SupportedChains,
} from 'types';
import { Hex } from 'viem';

import { AgreementEligibilityDetails } from './agreement';
import { AllowlistEligibilityDetails } from './allowlist';
import { ElectionEligibilityDetails } from './election';
import { JokeRaceEligibilityDetails } from './joke-race';
import { StakingEligibilityDetails } from './staking';

export const MODULE_DETAILS: { [key: string]: ModuleDetailsComponent } = {
  allowlist: AllowlistEligibilityDetails,
  agreement: AgreementEligibilityDetails,
  election: ElectionEligibilityDetails,
  'joke-race': JokeRaceEligibilityDetails,
  staking: StakingEligibilityDetails,
};

// handle fallback more known modules
export const ModuleCardDetails = ({
  hat,
  moduleInfo,
  chainId,
}: {
  hat: AppHat | undefined;
  moduleInfo: ModuleDetails | undefined;
  chainId: SupportedChains | undefined;
}) => {
  const knownModuleKeys = keys(KNOWN_ELIGIBILITY_MODULES);
  const knownModule = find(knownModuleKeys, (key) =>
    KNOWN_ELIGIBILITY_MODULES[key].includes(
      moduleInfo?.implementationAddress as Hex,
    ),
  );

  if (knownModule && has(MODULE_DETAILS, knownModule)) {
    const moduleDetailsFn = MODULE_DETAILS[
      knownModule
    ] as ModuleDetailsComponent;
    if (!moduleDetailsFn || !moduleInfo || !chainId) return undefined;
    return moduleDetailsFn(moduleInfo, chainId);
  }
  return undefined;
};

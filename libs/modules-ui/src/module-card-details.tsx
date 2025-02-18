import { has } from 'lodash';
import { AppHat, ModuleDetails, ModuleDetailsComponent, SupportedChains } from 'types';
import { getKnownEligibilityModule } from 'utils';
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
  const knownModule = getKnownEligibilityModule(moduleInfo?.implementationAddress as Hex);

  if (knownModule && has(MODULE_DETAILS, knownModule)) {
    const moduleDetailsFn = MODULE_DETAILS[knownModule] as ModuleDetailsComponent;
    if (!moduleDetailsFn || !moduleInfo || !chainId) return undefined;
    return moduleDetailsFn(moduleInfo, chainId);
  }
  return undefined;
};

import { has, toLower } from 'lodash';
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
import { JokeRaceEligibilityDetails } from './jokeRace';
import { StakingEligibilityDetails } from './staking';

export const MODULE_DETAILS: { [key: Hex]: ModuleDetailsComponent } = {
  '0xac208e6668de569c6ea1db76decea70430335ed5': AllowlistEligibilityDetails,
  '0xf6bc6dd30403e6ff5b3bebead32b8fce1b753aa1': AgreementEligibilityDetails,
  '0xd3b916a8f0c4f9d1d5b6af29c3c012dbd4f3149e': ElectionEligibilityDetails,
  '0xae0e56a0c509da713722c1affcf4b5f1c6cdc73a': JokeRaceEligibilityDetails,
  '0x9e01030af633be5a439df122f2eef750b44b8ac7': StakingEligibilityDetails,
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
  if (has(MODULE_DETAILS, toLower(moduleInfo?.implementationAddress))) {
    const moduleDetailsFn = MODULE_DETAILS[
      toLower(moduleInfo?.implementationAddress)
    ] as ModuleDetailsComponent;
    if (!moduleDetailsFn || !moduleInfo || !chainId) return undefined;
    return moduleDetailsFn(moduleInfo, chainId);
  }
  return undefined;
};

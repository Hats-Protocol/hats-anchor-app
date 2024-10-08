'use client';

import { CONTROLLER_TYPES, ELIGIBILITY_MODULES } from '@hatsprotocol/constants';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { AppHat, ModuleDetails, SupportedChains } from 'types';
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

export const KnownEligibilityModule = ({
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
  selectedHat,
  modalSuffix,
  isReadyToClaim,
  setIsReadyToClaim,
}: KnownEligibilityModuleParameters) => {
  switch (moduleDetails?.name) {
    case ELIGIBILITY_MODULES.agreement:
      return (
        <AgreementEligibilityRule
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
          modalSuffix={modalSuffix}
          isReadyToClaim={isReadyToClaim}
          setIsReadyToClaim={setIsReadyToClaim}
        />
      );
    case ELIGIBILITY_MODULES.allowlist:
      return (
        <AllowlistEligibilityRule
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
          modalSuffix={modalSuffix}
        />
      );
    case ELIGIBILITY_MODULES.election:
      return (
        <ElectionEligibilityRule
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
          modalSuffix={modalSuffix}
        />
      );
    case ELIGIBILITY_MODULES.erc1155:
      return (
        <Erc1155EligibilityRule
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
          modalSuffix={modalSuffix}
        />
      );
    case ELIGIBILITY_MODULES.erc20:
      return (
        <Erc20EligibilityRule
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
          modalSuffix={modalSuffix}
        />
      );
    case ELIGIBILITY_MODULES.erc721:
      return (
        <Erc721EligibilityRule
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
          modalSuffix={modalSuffix}
        />
      );
    case ELIGIBILITY_MODULES.hatWearing:
      return (
        <HatWearingEligibilityRule
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
          modalSuffix={modalSuffix}
        />
      );
    case ELIGIBILITY_MODULES.jokerace:
      return (
        <JokeRaceEligibilityRule
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
          modalSuffix={modalSuffix}
        />
      );
    case ELIGIBILITY_MODULES.passthrough:
      return (
        <PassthroughModuleRule
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
          moduleType={CONTROLLER_TYPES.eligibility}
          modalSuffix={modalSuffix}
        />
      );
    case ELIGIBILITY_MODULES.staking:
      return (
        <StakingEligibilityRule
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
          modalSuffix={modalSuffix}
        />
      );
    case ELIGIBILITY_MODULES.unlock:
      return (
        <UnlockEligibilityRule
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
          modalSuffix={modalSuffix}
        />
      );
  }

  return (
    <UnknownEligibilityRule
      chainId={chainId}
      wearer={wearer}
      selectedHat={selectedHat}
    />
  );
};

interface KnownEligibilityModuleParameters {
  moduleDetails: ModuleDetails | undefined;
  moduleParameters: ModuleParameter[] | undefined;
  selectedHat: AppHat | undefined;
  wearer: Hex | undefined;
  chainId: SupportedChains | undefined;
  modalSuffix?: string | undefined;
  isReadyToClaim?: boolean | undefined;
  setIsReadyToClaim?: (isReadyToClaim: boolean) => void;
}

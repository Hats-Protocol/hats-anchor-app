'use client';

import { CONTROLLER_TYPES, ELIGIBILITY_MODULES } from '@hatsprotocol/constants';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { AppHat, ModuleDetails, SupportedChains } from 'types';
import { Hex } from 'viem';

import AgreementEligibility from './Agreement';
import AllowlistEligibility from './Allowlist';
import ElectionEligibility from './Election';
import Erc20Eligibility from './Erc20';
import Erc721Eligibility from './Erc721';
import Erc1155Eligibility from './Erc1155';
import GenericEligibility from './GenericEligibility';
import HatWearingEligibility from './HatWearing';
import JokeRaceEligibility from './JokeRace';
import PassthroughModule from './Passthrough';
import StakingEligibility from './Staking';

const KnownModule = ({
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
  selectedHat,
}: KnownModuleParameters) => {
  switch (moduleDetails?.name) {
    case ELIGIBILITY_MODULES.agreement:
      return (
        <AgreementEligibility
          moduleDetails={moduleDetails}
          chainId={chainId}
          wearer={wearer}
          selectedHat={selectedHat}
        />
      );
    case ELIGIBILITY_MODULES.allowlist:
      return (
        <AllowlistEligibility
          selectedHat={selectedHat}
          wearer={wearer}
          chainId={chainId}
        />
      );
    case ELIGIBILITY_MODULES.election:
      return (
        <ElectionEligibility
          moduleDetails={moduleDetails}
          // parameters={parameters}
          chainId={chainId}
          wearer={wearer}
          selectedHat={selectedHat}
        />
      );
    case ELIGIBILITY_MODULES.erc1155:
      return (
        <Erc1155Eligibility
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          chainId={chainId}
          wearer={wearer}
          selectedHat={selectedHat}
        />
      );
    case ELIGIBILITY_MODULES.erc20:
      return (
        <Erc20Eligibility
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          chainId={chainId}
          wearer={wearer}
          selectedHat={selectedHat}
        />
      );
    case ELIGIBILITY_MODULES.erc721:
      return (
        <Erc721Eligibility
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          chainId={chainId}
          wearer={wearer}
          selectedHat={selectedHat}
        />
      );
    case ELIGIBILITY_MODULES.hatWearing:
      return (
        <HatWearingEligibility
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          chainId={chainId}
          wearer={wearer}
          selectedHat={selectedHat}
        />
      );
    case ELIGIBILITY_MODULES.jokerace:
      return (
        <JokeRaceEligibility
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          chainId={chainId}
          wearer={wearer}
          selectedHat={selectedHat}
        />
      );
    case ELIGIBILITY_MODULES.passthrough:
      return (
        <PassthroughModule
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          chainId={chainId}
          wearer={wearer}
          selectedHat={selectedHat}
          moduleType={CONTROLLER_TYPES.eligibility}
        />
      );
    case ELIGIBILITY_MODULES.staking:
      return (
        <StakingEligibility
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          chainId={chainId}
          wearer={wearer}
          selectedHat={selectedHat}
        />
      );
  }

  return (
    <GenericEligibility
      chainId={chainId}
      wearer={wearer}
      selectedHat={selectedHat}
    />
  );
};

interface KnownModuleParameters {
  moduleDetails: ModuleDetails | undefined;
  moduleParameters: ModuleParameter[] | undefined;
  selectedHat: AppHat | undefined;
  wearer: Hex | undefined;
  chainId: SupportedChains | undefined;
}

export default KnownModule;

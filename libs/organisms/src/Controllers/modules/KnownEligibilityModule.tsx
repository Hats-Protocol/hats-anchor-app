'use client';

import { CONTROLLER_TYPES } from '@hatsprotocol/constants';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { AppHat, ModuleDetails, SupportedChains } from 'types';
import { Hex } from 'viem';

import { ELIGIBILITY_MODULES } from '../utils';
import AgreementEligibility from './Agreement';
import AllowlistEligibility from './Allowlist';
import ElectionEligibility from './Election';
import Erc20Eligibility from './Erc20';
import Erc721Eligibility from './Erc721';
import Erc1155Eligibility from './Erc1155';
import HatWearingEligibility from './HatWearing';
import JokeRaceEligibility from './JokeRace';
import PassthroughModule from './Passthrough';
import StakingEligibility from './Staking';
import UnknownEligibility from './UnknownEligibility';

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
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
        />
      );
    case ELIGIBILITY_MODULES.allowlist:
      return (
        <AllowlistEligibility
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
        />
      );
    case ELIGIBILITY_MODULES.election:
      return (
        <ElectionEligibility
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
        />
      );
    case ELIGIBILITY_MODULES.erc1155:
      return (
        <Erc1155Eligibility
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
        />
      );
    case ELIGIBILITY_MODULES.erc20:
      return (
        <Erc20Eligibility
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
        />
      );
    case ELIGIBILITY_MODULES.erc721:
      return (
        <Erc721Eligibility
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
        />
      );
    case ELIGIBILITY_MODULES.hatWearing:
      return (
        <HatWearingEligibility
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
        />
      );
    case ELIGIBILITY_MODULES.jokerace:
      return (
        <JokeRaceEligibility
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
        />
      );
    case ELIGIBILITY_MODULES.passthrough:
      return (
        <PassthroughModule
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
          moduleType={CONTROLLER_TYPES.eligibility}
        />
      );
    case ELIGIBILITY_MODULES.staking:
      return (
        <StakingEligibility
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          moduleParameters={moduleParameters}
          wearer={wearer}
          chainId={chainId}
        />
      );
  }

  return (
    <UnknownEligibility
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

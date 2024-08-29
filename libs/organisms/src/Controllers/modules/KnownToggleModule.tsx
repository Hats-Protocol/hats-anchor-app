'use client';

import { CONTROLLER_TYPES, TOGGLE_MODULES } from '@hatsprotocol/constants';
import { Ruleset } from '@hatsprotocol/modules-sdk';
import { first, pick } from 'lodash';
import { AppHat, ModuleDetails, SupportedChains } from 'types';
import { Hex } from 'viem';

import GenericToggle from './GenericToggle';
import PassthroughModule from './Passthrough';
import SeasonToggle from './Season';

const KnownModule = ({
  ruleSets,
  chainId,
  wearer,
  selectedHat,
}: KnownModuleParameters) => {
  const localModule = first(first(ruleSets));
  const { module: moduleDetails, liveParams: parameters } = pick(localModule, [
    'module',
    'liveParams',
  ]);

  switch (moduleDetails?.name) {
    case TOGGLE_MODULES.season:
      return (
        <SeasonToggle
          moduleDetails={moduleDetails as ModuleDetails}
          moduleParameters={parameters}
          chainId={chainId}
          wearer={wearer}
          selectedHat={selectedHat}
        />
      );
    case TOGGLE_MODULES.passthrough:
      return (
        <PassthroughModule
          moduleDetails={moduleDetails as ModuleDetails}
          moduleParameters={parameters}
          chainId={chainId}
          wearer={wearer}
          selectedHat={selectedHat}
          moduleType={CONTROLLER_TYPES.toggle}
        />
      );
  }

  return (
    <GenericToggle
      chainId={chainId}
      wearer={wearer}
      selectedHat={selectedHat}
    />
  );
};

interface KnownModuleParameters {
  ruleSets: Ruleset[] | undefined;
  selectedHat: AppHat | undefined;
  wearer: Hex | undefined;
  chainId: SupportedChains | undefined;
}

export default KnownModule;

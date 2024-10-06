'use client';

import { CONTROLLER_TYPES, TOGGLE_MODULES } from '@hatsprotocol/constants';
import { Ruleset } from '@hatsprotocol/modules-sdk';
import { first, pick } from 'lodash';
import { AppHat, ModuleDetails, SupportedChains } from 'types';
import { Hex } from 'viem';

import { PassthroughModuleRule } from '../hat-controlled/passthrough-eligibility-rule';
import { SeasonToggleRule } from '../season/season-toggle-rule';
import { UnknownToggleRule } from './unknown-toggle';

export const KnownToggleModule = ({
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
        <SeasonToggleRule
          moduleDetails={moduleDetails as ModuleDetails}
          moduleParameters={parameters}
          chainId={chainId}
          wearer={wearer}
          selectedHat={selectedHat}
        />
      );
    case TOGGLE_MODULES.passthrough:
      return (
        <PassthroughModuleRule
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
    <UnknownToggleRule
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

export default KnownToggleModule;

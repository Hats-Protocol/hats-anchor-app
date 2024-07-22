'use client';

import { Text } from '@chakra-ui/react';
import { CONTROLLER_TYPES } from '@hatsprotocol/constants';
import { ModuleParameter, Ruleset } from '@hatsprotocol/modules-sdk';
import { first, pick } from 'lodash';
import { AppHat, ModuleDetails, SupportedChains } from 'types';
import { Hex } from 'viem';

import { TOGGLE_MODULES } from '../utils';
import EligibilityRule from './EligibilityRule';
import PassthroughModule from './Passthrough';
import SeasonToggle from './Season';

const KnownModule = ({
  moduleDetails: localModuleDetails,
  parameters: localParameters,
  ruleSets,
  chainId,
  wearer,
  selectedHat,
}: KnownModuleParameters) => {
  const localRuleSets = [
    [{ module: localModuleDetails, parameters: localParameters }],
  ];
  const localModule = first(first(localRuleSets));
  const { module: moduleDetails, parameters } = pick(localModule, [
    'module',
    'parameters',
  ]);

  switch (moduleDetails?.name) {
    case TOGGLE_MODULES.season:
      return (
        <SeasonToggle
          moduleDetails={moduleDetails}
          moduleParameters={parameters}
          chainId={chainId}
          wearer={wearer}
          selectedHat={selectedHat}
        />
      );
    case TOGGLE_MODULES.passthrough:
      return (
        <PassthroughModule
          moduleDetails={moduleDetails}
          moduleParameters={parameters}
          chainId={chainId}
          wearer={wearer}
          selectedHat={selectedHat}
          moduleType={CONTROLLER_TYPES.toggle}
        />
      );
  }

  return (
    <EligibilityRule
      rule={<Text>Test</Text>}
      status=''
      displayStatus=''
      icon={undefined}
    />
  );
};

interface KnownModuleParameters {
  moduleDetails: ModuleDetails | undefined;
  parameters: ModuleParameter[] | undefined;
  ruleSets: Ruleset[] | undefined;
  selectedHat: AppHat | undefined;
  wearer: Hex | undefined;
  chainId: SupportedChains | undefined;
}

export default KnownModule;

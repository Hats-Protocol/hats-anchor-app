'use client';

import { CONTROLLER_TYPES, TOGGLE_MODULES } from '@hatsprotocol/constants';
import { Ruleset } from '@hatsprotocol/modules-sdk';
import { first, has, pick } from 'lodash';
import { ReactNode } from 'react';
import { AppHat, ModuleDetails, SupportedChains } from 'types';
import { Hex } from 'viem';

import { PassthroughModuleRule } from '../hat-controlled/passthrough-eligibility-rule';
import { SeasonToggleRule } from '../season/season-toggle-rule';
import { UnknownToggleRule } from './unknown-toggle';

interface KnownModuleParameters {
  ruleSets: Ruleset[] | undefined;
  selectedHat: AppHat | undefined;
  wearer: Hex | undefined;
  chainId: SupportedChains | undefined;
}

type ToggleRuleComponent = ({
  moduleDetails,
  moduleParameters,
  selectedHat,
  wearer,
  chainId,
}: {
  moduleDetails: ModuleDetails;
  moduleParameters: any;
  selectedHat: AppHat | undefined;
  wearer: Hex | undefined;
  chainId: SupportedChains | undefined;
}) => ReactNode;

const ToggleModuleRules: { [key: string]: ToggleRuleComponent } = {
  [TOGGLE_MODULES.season]: SeasonToggleRule,
  [TOGGLE_MODULES.passthrough]: (props) => <PassthroughModuleRule {...props} moduleType={CONTROLLER_TYPES.toggle} />,
};

export const KnownToggleModule = ({ ruleSets, chainId, wearer, selectedHat }: KnownModuleParameters) => {
  const localModule = first(first(ruleSets));
  const { module: moduleDetails, liveParams: parameters } = pick(localModule, ['module', 'liveParams']);

  if (!moduleDetails?.name || !has(ToggleModuleRules, moduleDetails.name)) {
    return <UnknownToggleRule chainId={chainId} wearer={wearer} selectedHat={selectedHat} />;
  }

  const RuleComponent = ToggleModuleRules[moduleDetails.name];

  // spread moduleDetails and add liveParameters and instanceAddress
  const moduleDetailsWithLiveParams: ModuleDetails = {
    ...moduleDetails,
    liveParameters: parameters,
    instanceAddress: localModule?.address,
  };

  return (
    <RuleComponent
      moduleDetails={moduleDetailsWithLiveParams}
      moduleParameters={parameters}
      chainId={chainId}
      wearer={wearer}
      selectedHat={selectedHat}
    />
  );
};

export default KnownToggleModule;

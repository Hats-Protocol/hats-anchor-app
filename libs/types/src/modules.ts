import { Module, ModuleParameter, Role, WriteFunction } from '@hatsprotocol/modules-sdk';
import { ReactNode } from 'react';
import { Hex } from 'viem';

import { SupportedChains } from './chains';
import { CouncilMember, LabeledModules } from './councils';
import { AppHat } from './hat';

export type DeploymentType = 'onlyModule' | 'moduleAndClaimsHatter' | 'onlyClaimsHatter';

export type ModuleCreationArg = {
  name: string;
  description: string;
  type: string;
  example: unknown;
  displayType: string;
  optional?: boolean;
};

export type ModuleCreationArgs = {
  immutable: ModuleCreationArg[];
  mutable: ModuleCreationArg[];
};

export interface ModuleDetails extends Module {
  // id: Hex; // was added to registry and SDK migrate module address to `instanceAddress`
  liveParameters: ModuleParameter[] | undefined;
  instanceAddress?: Hex;
}

export type ModuleDetailsComponent = (m: ModuleDetails, chainId: SupportedChains) => ReactNode | undefined;

export interface ModuleDetailRole {
  param: string;
  label: string;
  tooltip: string;
}

export interface ModuleRole extends Role {
  label: string;
}

export interface ModuleFunction extends WriteFunction {
  isCustom?: boolean;
  onClick: (args?: unknown) => void;
  icon?: ReactNode;
}

export interface EligibilityRule {
  module: Module;
  address: `0x${string}`;
  liveParams?: ModuleParameter[] | undefined;
}

export interface CurrentEligibility {
  [key: Hex]: {
    eligible: boolean;
    goodStanding: boolean;
  };
}

export interface StatusManagerProps {
  rule: EligibilityRule;
  user: CouncilMember | undefined;
  selectedHat: AppHat | undefined;
  chainId: number;
  labeledModules: LabeledModules | undefined;
  currentEligibility: CurrentEligibility | undefined;
}

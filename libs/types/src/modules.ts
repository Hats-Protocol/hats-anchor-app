import {
  Module,
  ModuleParameter,
  Role,
  WriteFunction,
} from '@hatsprotocol/modules-sdk';
import { ReactNode } from 'react';
import { Hex } from 'viem';

import { SupportedChains } from './chains';

export type DeploymentType =
  | 'onlyModule'
  | 'moduleAndClaimsHatter'
  | 'onlyClaimsHatter';

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
  id: Hex;
  customRoles: ModuleRole[];
  liveParameters: ModuleParameter[] | undefined;
}

export type ModuleDetailsComponent = (
  m: ModuleDetails,
  chainId: SupportedChains,
) => ReactNode | undefined;

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

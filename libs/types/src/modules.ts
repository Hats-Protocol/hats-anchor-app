import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { ReactNode } from 'react';
import { Hex } from 'viem';

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
  liveParameters: ModuleParameter[] | undefined;
}

export type ModuleDetailsComponent = (
  m: ModuleDetails,
) => ReactNode | undefined;

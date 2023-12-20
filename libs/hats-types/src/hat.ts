import { Module } from '@hatsprotocol/modules-sdk';
import { Hat } from '@hatsprotocol/sdk-v1-subgraph';
import { Hex } from 'viem';

import { Authority } from './authorities';
import { SupportedChains } from './chains';

// sdk
export interface HatEvent {
  id: string;
  timestamp: string;
  transactionID: string;
}

// details-mgr
export type DetailsItem = {
  link: string;
  label: string;
  description?: string;
  imageUri?: string;
};

export interface HatWearer {
  id: Hex;
  isContract?: boolean;
  ensName?: string | null;
}

export type HatDetailsKeys = keyof HatDetails;

// details-mgr
export type HatDetails = {
  name: string;
  description?: string;
  responsibilities?: DetailsItem[];
  authorities?: Authority[];
  guilds?: string[];
  spaces?: string[];
  eligibility?: {
    manual?: boolean;
    criteria?: DetailsItem[];
  };
  toggle?: {
    manual?: boolean;
    criteria?: DetailsItem[];
  };
};

export interface AppHat extends Hat {
  id: Hex; // Confirm `Hat` ID is Hex instead of string
  chainId?: SupportedChains;
  imageUrl?: string;
  detailsObject?: {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: HatDetails;
  };
  name?: string;
  parentId?: Hex | undefined;
  treeId?: Hex;
  isLinked?: boolean;
  url?: string;
  active?: boolean;
  type?: string;
  displayName?: string;
}

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
  customRoles: any[];
}

export interface HatExport {
  id: Hex;
  status: boolean;
  createdAt?: number;
  details: string;
  maxSupply: number;
  eligibility: Hex;
  toggle: Hex;
  mutable: boolean;
  imageUri: string;
  currentSupply: number;
  wearers: Hex[];
  adminId: Hex;
  // imageUrl?: string | null;
  detailsObject?: {
    type: string;
    data: HatDetails;
  };
}

export interface HatAuthorityResponse {
  hatAuthority: HatAuthority;
}

export interface HatSignerGate {
  id: Hex;
  type: string;
  safe: Hex;
  minThreshold: string;
  targetThreshold: string;
  maxSigners: string;
}

export interface HatAuthority {
  allowListOwner: { id: Hex }[];
  allowListArbitrator: { id: Hex }[];
  electionsAdmin: { id: Hex }[];
  electionsBallotBox: { id: Hex }[];
  eligibilityTogglePassthrough: { id: Hex }[];
  hsgOwner: HatSignerGate[];
  hsgSigner: HatSignerGate[];
  jokeraceAdmin: { id: Hex }[];
  stakingJudge: { id: Hex }[];
  stakingRecipient: { id: Hex }[];
}

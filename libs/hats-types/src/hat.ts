import { Module } from '@hatsprotocol/modules-sdk';
import { Hex } from 'viem';

import { Authority } from './authorities';
import { SupportedChains } from './chains';
import { Tree } from './tree';

export interface HatEvent {
  id: string;
  timestamp: string;
  transactionID: string;
}

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

export interface Hat {
  id: Hex;
  chainId: SupportedChains;
  prettyId?: string;
  tree?: Partial<Tree>;
  status: boolean;
  createdAt?: string;
  details: string;
  maxSupply: string;
  eligibility: Hex;
  toggle: Hex;
  mutable: boolean;
  imageUri: string;
  imageUrl?: string | null;
  levelAtLocalTree: number;
  currentSupply: string;
  events: HatEvent[];
  wearers: HatWearer[];
  admin?: Partial<Hat>;
  claimableBy?: Hex[];
  claimableForBy?: Hex[];
  // app specific
  detailsObject?: {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: HatDetails;
  };
  name: string;
  parentId: Hex | undefined;
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
  hatAuthority: {
    allowListOwner: { id: string }[];
    allowListArbitrator: { id: string }[];
    electionsAdmin: { id: string }[];
    electionsBallotBox: { id: string }[];
    eligibilityTogglePassthrough: { id: string }[];
    hsgOwner: { id: string }[];
    hsgSigner: { id: string }[];
    jokeraceAdmin: { id: string }[];
    stakingJudge: { id: string }[];
    stakingRecipient: { id: string }[];
  };
}

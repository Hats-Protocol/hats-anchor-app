import { WriteFunction } from '@hatsprotocol/hsg-sdk';
import { Hat } from '@hatsprotocol/sdk-v1-subgraph';
import { ReactNode } from 'react';
import { Chain, Hex } from 'viem';

import { Authority } from './authorities';
import { SupportedChains } from './chains';

// details-mgr
export type DetailsItem = {
  link: string;
  label: string;
  description?: string;
  imageUri?: string;
  imageUrl?: string; // old field, prefer `imageUri`
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
  extendedEligibility?: HatWearer;
  extendedToggle?: HatWearer;
  // object assembled to be used in the org chart wearers section
  orgChartWearers?: {
    color: string;
    accent: string;
    icon: string;
    content: string;
    contentWidth: string;
    accentWidth: string;
  };
  network?: Chain;
}

export interface HatWithDepth extends AppHat {
  ipId?: string;
  depth?: number;
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

export interface HatElectionResponse {
  hatsElectionEligibility: ElectionsAuthority;
}

export interface HatSignerGate {
  id: Hex;
  hatId: Hex;
  type: string;
  safe: Hex;
  minThreshold: string;
  targetThreshold: string;
  maxSigners: string;
  ownerHat?: {
    id: Hex;
  };
  signerHats?: {
    id: Hex;
  }[];
}

export interface HatAuthority {
  allowListOwner: { id: Hex; hatId: Hex }[];
  allowListArbitrator: { id: Hex; hatId: Hex }[];
  electionsAdmin: { id: Hex; hatId: Hex }[];
  electionsBallotBox: { id: Hex; hatId: Hex }[];
  eligibilityTogglePassthrough: { id: Hex; hatId: Hex }[];
  hsgOwner: HatSignerGate[];
  hsgSigner: HatSignerGate[];
  jokeraceAdmin: { id: Hex; hatId: Hex }[];
  stakingJudge: { id: Hex; hatId: Hex }[];
  stakingRecipient: { id: Hex; hatId: Hex }[];
  agreementOwner: { id: Hex; hatId: Hex }[];
  agreementArbitrator: { id: Hex; hatId: Hex }[];
  hatsAccount1ofN: HatsAccount1ofN[];
}

export interface ElectionsAuthority {
  adminHat: { id: Hex }[];
  ballotBoxHat: { id: Hex };
  hatId: Hex;
  id: Hex;
  userRoles: string[];
}

export type HatsAccount1ofN = {
  id: string;
  accountOfHat: {
    id: string;
  };
  operations: HatsAccount1ofNOperation[];
};

type HatsAccount1ofNOperation = {
  id: string;
  hatsAccount: HatsAccount1ofN;
  signer: string;
  to: string;
  value: bigint;
  callData: Uint8Array;
  operationType: string;
};

export interface AppWriteFunction extends WriteFunction {
  isCustom?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
}

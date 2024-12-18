import { HsgType } from '@hatsprotocol/hsg-sdk';
import { ReactNode } from 'react';
import { Hex } from 'viem';

import { ModuleDetails, ModuleFunction } from './modules';

export type AuthorityType =
  | 'protocol'
  | 'modules'
  | 'account'
  | 'hsg'
  | 'onchain'
  | 'gate'
  | 'manual';

export type HSGConfig = {
  type: HsgType;
  minThreshold: string;
  targetThreshold: string;
  maxSigners: string;
  ownerHat?: {
    id: Hex;
  };
  signerHats?: {
    id: Hex;
  }[];
  safe?: Hex;
};

// might be worth splitting this into multiple types
export type Authority = {
  label: string;
  subLabel?: string;
  link?: string;
  gate?: string | undefined;
  description?: ReactNode;
  imageUrl?: string;
  type?: string | AuthorityType | HsgType | undefined;
  id?: string | number;
  hatId?: Hex;
  strategies?: SnapshotStrategy[];
  functions?: ModuleFunction[];
  instanceAddress?: string; // previously Hex
  moduleAddress?: Hex;
  moduleLabel?: string;
  hsgConfig?: HSGConfig;
  moduleInfo?: ModuleDetails;
};

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

export interface SnapshotStrategy {
  name: string;
  network: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: { [key: string]: any };
}

export interface SnapshotSpace {
  id: string;
  name: string;
  about: string;
  network: string;
  symbol: string;
  members: number;
  strategies: SnapshotStrategy[];
}

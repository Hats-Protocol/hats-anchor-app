import { Module } from '@hatsprotocol/modules-sdk';
import { Hex } from 'viem';

import { ITree } from './tree';

export interface IHatEvent {
  id: string;
  timestamp: string;
  transactionID: string;
}

export type DetailsItem = {
  link: string;
  label: string;
};

export interface IHatWearer {
  id: Hex;
  isContract?: boolean;
  ensName?: string | null;
}

export interface HatRole {
  role: string;
  guild: string;
  requirements: (string | null)[];
}

export type HatDetails = {
  name: string;
  description?: string;
  responsibilities?: DetailsItem[];
  authorities?: DetailsItem[];
  guilds?: string[];
  eligibility?: {
    manual?: boolean;
    criteria?: DetailsItem[];
  };
  toggle?: {
    manual?: boolean;
    criteria?: DetailsItem[];
  };
};

export interface IHat {
  id: Hex;
  chainId: number;
  prettyId?: string;
  tree?: Partial<ITree>;
  status: boolean;
  createdAt?: string;
  details: string;
  maxSupply: string;
  eligibility: Hex;
  extendedEligibility?: IHatWearer;
  toggle: Hex;
  extendedToggle?: IHatWearer;
  mutable: boolean;
  imageUri: string;
  imageUrl?: string | null;
  levelAtLocalTree: number;
  currentSupply: string;
  events: IHatEvent[];
  wearers: IHatWearer[];
  extendedWearers?: IHatWearer[];
  admin?: Partial<IHat>;
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
  newName?: string;
  newImage?: string;
}

export type ModuleKind = 'eligibility' | 'toggle';

export type ModuleCreationArg = {
  name: string;
  description: string;
  type: string;
  example: unknown;
  displayType: string;
};

export type ModuleCreationArgs = {
  immutable: ModuleCreationArg[];
  mutable: ModuleCreationArg[];
};

export interface ModuleDetails extends Module {
  id: string;
}

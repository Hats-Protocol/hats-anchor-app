import { ArgumentTsType } from '@hatsprotocol/modules-sdk';
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

export type Module = 'eligibility' | 'toggle';

export type ModuleCreationArg = {
  name: string;
  description: string;
  type: ArgumentTsType;
  example: string | string[];
  displayType: 'hat' | 'default' | 'timestamp' | 'seconds';
};

export type ModuleCreationArgs = {
  immutable: ModuleCreationArg[];
  mutable: ModuleCreationArg[];
};

interface Deployment {
  chainId: string;
  block: string;
}

interface Link {
  label: string;
  link: string;
}

interface Parameter {
  displayType: string;
  functionName: string;
  label: string;
}

export interface ModuleDetails {
  abi: any[];
  creationArgs: ModuleCreationArgs;
  deployments: Deployment[];
  details: string[];
  id: string;
  implementationAddress: string;
  links: Link[];
  name: string;
  parameters: Parameter[];
  type: {
    eligibility: boolean;
    toggle: boolean;
    hatter: boolean;
  };
}

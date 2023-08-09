import { ReactNode } from 'react';

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
  id: `0x${string}`;
  isContract?: boolean;
  ensName?: string | null;
}

export interface IHat {
  id: string;
  chainId: number;
  prettyId?: string;
  tree?: Partial<ITree>;
  status: boolean;
  createdAt?: string;
  details: string;
  maxSupply: string;
  eligibility: `0x${string}`;
  extendedEligibility?: IHatWearer;
  toggle: `0x${string}`;
  extendedToggle?: IHatWearer;
  mutable: boolean;
  imageUri?: string;
  imageUrl?: string;
  levelAtLocalTree: number;
  currentSupply: string;
  events: IHatEvent[];
  wearers: IHatWearer[]; // (`0x${string}` | IHatWearer)[];
  extendedWearers?: IHatWearer[];
  admin?: Partial<IHat>;
  detailsObject?: {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: HatDetails;
  };
  name?: string;
  parentId?: string | null;
  treeId?: string;
  isLinked?: boolean;
  url?: string;
  active?: boolean;
  type?: string;
}

export interface ITreeEvent extends IHatEvent {
  hat: Partial<IHat>;
}

export interface ITree {
  id: string;
  chainId: number;
  hats: IHat[];
  events: ITreeEvent[];
  childOfTree: string | null;
  parentOfTrees: ITree[];
  linkedToHat: IHat | null;
  linkRequestFromTree: string | null;
}

export type HierarchyObject = {
  id: string;
  parentId: string | null;
  firstChild: string | null;
  leftSibling: string | null;
  rightSibling: string | null;
};

export type InputObject = {
  id: string;
  parentId: string;
};

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

export type ImageFile = {
  path: string;
  preview: string;
  lastModified: number;
  lastModifiedDate: Date;
  name: string;
  size: number;
  type: string;
  webkitRelativePath: string;
};

export interface IControls {
  label: string;
  value: string;
  icon: ReactNode;
}

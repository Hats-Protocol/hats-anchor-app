import { ReactNode } from 'react';
import { Hex } from 'viem';

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
}

export interface ITreeEvent extends IHatEvent {
  hat: Partial<IHat>;
}

export interface ITree {
  id: Hex;
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
  parentId: string | null | undefined;
  firstChild: string | null | undefined;
  leftSibling: string | null | undefined;
  rightSibling: string | null | undefined;
};

export type InputObject = {
  id: string;
  parentId: string | undefined;
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

export type FormData = FormDataDetails & {
  maxSupply?: string;
  eligibility?: Hex;
  toggle?: Hex;
  mutable: string;
  imageUrl?: string;
  id: Hex;
  wearers: Hex[];
  parentId?: Hex;
};

export type FormDataDetails = {
  name: string;
  description: string;
  guilds: string[];
  responsibilities: DetailsItem[];
  authorities: DetailsItem[];
  isEligibilityManual: string;
  isToggleManual: string;
  revocationsCriteria: DetailsItem[];
  deactivationsCriteria: DetailsItem[];
  newImageUri?: string;
};

export type FieldItem = { name: keyof FormData; label: string };

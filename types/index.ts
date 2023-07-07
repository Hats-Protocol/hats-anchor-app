export interface IHatEvent {
  id: string;
  timestamp: string;
  transactionID: string;
}

export interface IHatWearer {
  id: `0x${string}`;
  isContract?: boolean;
  ensName?: string | null;
}

export interface IHat {
  id: string;
  chainId: number;
  prettyId: string;
  tree: ITree;
  status: boolean;
  createdAt: string;
  details: string;
  detailsObject?: {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  };
  maxSupply: string;
  eligibility: `0x${string}`;
  toggle: `0x${string}`;
  mutable: boolean;
  imageUri: string;
  imageUrl?: string;
  levelAtLocalTree: number;
  currentSupply: string;
  events: IHatEvent[];
  wearers: (`0x${string}` | IHatWearer)[];
  admin: IHat;
}

export interface IHatData {
  id: string;
  name: string;
  parentId: string | null;
  // imageURI: string;
  imageUrl?: string;
  treeId: string;
  isLinked: boolean;
  url: string;
  details?: string | object;
  active: boolean;
  currentSupply?: string;
  maxSupply?: string;
  wearers?: (`0x${string}` | IHatWearer)[];
  eligibility?: IHatWearer;
  toggle?: IHatWearer;
  levelAtLocalTree?: number;
  prettyId?: string;
}

interface ITreeEvent extends IHatEvent {
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

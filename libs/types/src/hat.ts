import { Hat } from '@hatsprotocol/sdk-v1-subgraph';
import { Hex } from 'viem';

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

// Contract Details returned from Etherscan
interface ContractDetails {
  contractName: string;
  // abi: string; // omitted in API route fetch
  // sourceCode: string; // omitted in API route fetch
  compilerVersion: string;
  constructorArguments: string;
  evmVersion: string;
  id: string;
  implementation: string;
  library: string;
  licenseType: string;
  optimizationUsed: string;
  proxy: string;
  runs: string;
  swarmSource: string;
}

export interface HatWearer extends Partial<ContractDetails> {
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

export interface HatWithMetadata extends Hat {
  detailsMetadata?: string;
}

export interface AppHat extends HatWithMetadata {
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
  hatChartWearers?: {
    color: string;
    accent: string;
    icon: string;
    content: string;
    contentWidth: string;
    accentWidth: string;
  };
  metadata?: HatDetails;
  metadataType?: string;
}

export interface OrgChartHat extends AppHat {
  _collapsed?: boolean;
  _centeredWithDescendants?: boolean;
  _directSubordinatesPaging?: number;
  _directSubordinates?: number;
  _totalSubordinates?: number;
  _highlighted?: boolean;
  _upToTheRootHighlighted?: boolean;
  _expanded?: boolean;
  _centered?: boolean;
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

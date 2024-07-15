import { Hat, Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { Chain, Hex } from 'viem';

// sdk
export type LinkRequest = {
  id: Hex;
  requestedLinkToHat: Partial<Hat>;
};

export interface FeaturedTree {
  chainId: number;
  id: number;
  name: string;
  description: string;
  image: string;
  avatar: string;
}

export interface AppTree extends Tree {
  chainId?: Chain;
}

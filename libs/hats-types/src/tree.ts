import { Hex } from 'viem';

// sdk
export type LinkRequest = {
  id: Hex;
  requestedLinkToHat: {
    id: Hex;
    prettyId: Hex;
  };
};

export interface FeaturedTree {
  chainId: number;
  id: number;
  name: string;
  description: string;
  image: string;
  avatar: string;
}

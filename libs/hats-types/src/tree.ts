import { Hat } from '@hatsprotocol/sdk-v1-subgraph';
import { Hex } from 'viem';

import { HatEvent } from './hat';

// sdk
export type LinkRequest = {
  id: Hex;
  requestedLinkToHat: {
    id: Hex;
    prettyId: Hex;
  };
};

// sdk
export interface TreeEvent extends HatEvent {
  hat: Partial<Hat>;
}

export interface FeaturedTree {
  chainId: number;
  id: number;
  name: string;
  description: string;
  image: string;
  avatar: string;
}

import { Hex } from 'viem';

import { Hat, HatEvent } from './hat';

export type LinkRequest = {
  id: Hex;
  requestedLinkToHat: {
    id: Hex;
    prettyId: Hex;
  };
};

export interface TreeEvent extends HatEvent {
  hat: Partial<Hat>;
}

export interface Tree {
  id: Hex;
  chainId: number;
  hats: Hat[];
  events: TreeEvent[];
  childOfTree: string | null;
  parentOfTrees: Tree[];
  parentOfHats?: Hat[];
  linkedToHat: Hat | null;
  linkRequestFromTree: LinkRequest[];
}

export interface FeaturedTree {
  chainId: number;
  id: number;
  name: string;
  description: string;
  image: string;
  avatar: string;
}

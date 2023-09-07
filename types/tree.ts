import { Hex } from 'viem';

import { IHat, IHatEvent } from './hat';

export type LinkRequest = {
  id: Hex;
  requestedLinkToHat: {
    id: Hex;
    prettyId: Hex;
  };
};

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
  parentOfHats?: IHat[];
  linkedToHat: IHat | null;
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

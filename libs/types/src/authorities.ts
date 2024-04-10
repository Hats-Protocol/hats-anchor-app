import { HsgType } from '@hatsprotocol/hsg-sdk';
import { Hex } from 'viem';

import { AppWriteFunction } from './hat';

export type AuthorityType =
  | 'protocol'
  | 'modules'
  | 'wallet'
  | 'hsg'
  | 'onchain'
  | 'gate'
  | 'manual';

// might be worth splitting this into multiple types
export type Authority = {
  label: string;
  subLabel?: string;
  link?: string;
  gate?: string | undefined;
  description?: string;
  imageUrl?: string;
  type?: string | AuthorityType | HsgType | undefined;
  id?: string | number;
  hatId?: Hex;
  strategies?: SnapshotStrategy[];
  functions?: AppWriteFunction[];
  instanceAddress?: Hex;
  moduleAddress?: Hex;
  moduleLabel?: string;
  ownerHat?: {
    id: Hex;
  };
  signerHats?: {
    id: Hex;
  }[];
  safe?: Hex;
  hsgConfig?: {
    minThreshold: string;
    targetThreshold: string;
    maxSigners: string;
  };
};

export interface SnapshotStrategy {
  name: string;
  network: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: { [key: string]: any };
}

export interface SnapshotSpace {
  id: string;
  name: string;
  about: string;
  network: string;
  symbol: string;
  members: number;
  strategies: SnapshotStrategy[];
}

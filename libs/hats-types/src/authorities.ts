import { HsgType, WriteFunction } from '@hatsprotocol/hsg-sdk';
import { Hex } from 'viem';

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
  link?: string;
  gate?: string | undefined;
  description?: string;
  imageUrl?: string;
  type?: string | AuthorityType | undefined;
  id?: string | number;
  hatId?: Hex;
  strategies?: SnapshotStrategy[];
  functions?: WriteFunction[];
  instanceAddress?: Hex;
  moduleAddress?: Hex;
  moduleLabel?: string;
  hgsType?: HsgType;
  ownerHat?: {
    id: Hex;
  };
  signerHats?: {
    id: Hex;
  }[];
  safe?: Hex;
};

export interface SnapshotStrategy {
  name: string;
  network: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: { [key: string]: any };
}

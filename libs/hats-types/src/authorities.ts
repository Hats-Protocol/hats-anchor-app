import { Hex } from 'viem';

export type AuthorityType =
  | 'protocol'
  | 'modules'
  | 'wallet'
  | 'hsgSigner'
  | 'hsgOwner'
  | 'onchain'
  | 'gate'
  | 'manual';

export type Authority = {
  label: string;
  link: string;
  gate?: string | undefined;
  description?: string;
  imageUrl?: string;
  type?: string | AuthorityType | undefined;
  id?: string | number;
  strategies?: SnapshotStrategy[];
  functions?: any[];
  instanceAddress?: Hex;
  moduleAddress?: Hex;
};

export interface SnapshotStrategy {
  name: string;
  network: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: { [key: string]: any };
}

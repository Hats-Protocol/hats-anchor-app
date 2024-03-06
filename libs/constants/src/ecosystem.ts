import { SupportedChains } from 'types';

export const SAFE_URL = 'https://app.safe.global';
export const DAOHAUS_URL = 'https://admin.daohaus.club';

export const SAFE_CHAIN_MAP: { [key in SupportedChains]: string } = {
  1: 'eth',
  10: 'oeth',
  100: 'gno',
  137: 'matic',
  8453: 'base',
  42161: 'arb1',
  42220: 'celo',
  11155111: 'sep',
};

export type SnapshotApiUrls = { [key in SupportedChains]: string };

const MAINNET_SNAPSHOT_API_URL = 'https://hub.snapshot.org/graphql';
export const SNAPSHOT_API_URLS: SnapshotApiUrls = {
  1: MAINNET_SNAPSHOT_API_URL,
  10: MAINNET_SNAPSHOT_API_URL,
  100: MAINNET_SNAPSHOT_API_URL,
  137: MAINNET_SNAPSHOT_API_URL,
  8453: MAINNET_SNAPSHOT_API_URL,
  42161: MAINNET_SNAPSHOT_API_URL,
  42220: MAINNET_SNAPSHOT_API_URL,
  // testnet
  11155111: 'https://testnet.hub.snapshot.org/graphql',
};

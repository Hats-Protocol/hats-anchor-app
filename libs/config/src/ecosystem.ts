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
  84532: 'basesep',
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
  84532: 'https://testnet.hub.snapshot.org/graphql',
};

export const SAFE_API_URL: {
  [chainId in SupportedChains]: string | undefined;
} = {
  1: 'https://safe-transaction-mainnet.safe.global',
  10: 'https://safe-transaction-optimism.safe.global',
  100: 'https://safe-transaction-gnosis-chain.safe.global',
  137: 'https://safe-transaction-polygon.safe.global',
  8453: 'https://safe-transaction-base.safe.global',
  42161: 'https://safe-transaction-arbitrum.safe.global',
  42220: 'https://safe-transaction-celo.safe.global',
  11155111: 'https://safe-transaction-sepolia.safe.global',
  84532: 'https://safe-transaction-base-sepolia.safe.global',
};

export const TENDERLY_SIMULATION_URL = 'https://www.tdly.co/shared/simulation/';

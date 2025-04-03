import type { Chain } from 'viem';

export type SupportedChains =
  | 1 // mainnet
  | 10 // optimism
  | 100 // gnosis
  | 137 // polygon
  | 8453 // base
  | 42161 // arbitrum
  | 42220 // celo
  | 84532 // base sepolia
  | 11155111; // sepolia

export type ExtendedChain = Chain & {
  hasIcon: boolean;
  iconUrl: string;
  iconBackground: string;
};

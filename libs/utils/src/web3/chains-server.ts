import { CHAIN_IDS, chainsList } from '@hatsprotocol/config';
import { first, get, has, values } from 'lodash';
import { ExtendedChain, SupportedChains } from 'types';

export const chainsMap = (chainId?: number): ExtendedChain =>
  chainId ? (chainsList[chainId as SupportedChains] as ExtendedChain) : (first(values(chainsList)) as ExtendedChain);

export const explorerUrl = (chainId?: number) =>
  chainId &&
  get(chainsMap(chainId), 'blockExplorers.etherscan.url', get(chainsMap(chainId), 'blockExplorers.default.url'));

export const chainIcon = (chainId: number | undefined) => {
  if (!chainId) return undefined;

  const chain = chainsMap(chainId);
  if (!chain) return undefined;

  return chain.iconUrl;
};

export function getChainId(chainValue: string): SupportedChains {
  return CHAIN_IDS[chainValue];
}

const RPC_URLS: { [key: number]: string } = {
  1: process.env.NEXT_PUBLIC_MAINNET_HTTP_PROVIDER || '',
  10: process.env.NEXT_PUBLIC_OPTIMISM_HTTP_PROVIDER || '',
  100: process.env.NEXT_PUBLIC_GNOSIS_HTTP_PROVIDER || '',
  137: process.env.NEXT_PUBLIC_POLYGON_HTTP_PROVIDER || '',
  8453: process.env.NEXT_PUBLIC_BASE_HTTP_PROVIDER || '',
  42220: process.env.NEXT_PUBLIC_CELO_HTTP_PROVIDER || '',
  42161: process.env.NEXT_PUBLIC_ARBITRUM_HTTP_PROVIDER || '',
  11155111: process.env.NEXT_PUBLIC_SEPOLIA_HTTP_PROVIDER || '',
};

export const getRpcUrl = (chainId: number) => {
  if (!has(RPC_URLS, chainId)) {
    const chain = chainsMap(chainId);
    return first(get(chain, 'rpcUrls.default.http'));
  }

  return get(RPC_URLS, chainId);
};

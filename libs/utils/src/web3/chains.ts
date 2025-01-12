'use client';

import { CHAIN_IDS, chainsList } from '@hatsprotocol/constants';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  braveWallet,
  coinbaseWallet,
  dawnWallet,
  frameWallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  uniswapWallet,
  walletConnectWallet,
  zerionWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { concat, each, first, get, has, keys, map, toNumber, values } from 'lodash';
import { ExtendedChain, SupportedChains } from 'types';
import { Chain, http, Transport } from 'viem';
import { createConfig } from 'wagmi';
import { safe } from 'wagmi/connectors';

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!WC_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_WC_PROJECT_ID is not set');
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

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [coinbaseWallet, rainbowWallet],
    },
    {
      groupName: 'All',
      wallets: [
        injectedWallet,
        safeWallet,
        argentWallet,
        braveWallet,
        walletConnectWallet,
        dawnWallet,
        frameWallet,
        ledgerWallet,
        metaMaskWallet,
        rabbyWallet,
        uniswapWallet,
        zerionWallet,
      ],
    },
  ],
  {
    appName: 'Hats App',
    projectId: WC_PROJECT_ID,
  },
);

const transports = () => {
  const localTransports: { [key: string]: Transport } = {};
  each(chainsList, (chain, chainId) => {
    localTransports[chainId as keyof typeof localTransports] = http(getRpcUrl(toNumber(chainId)) as string);
  });

  return localTransports;
};

export const wagmiConfig = (overrideChains?: Chain[]) => {
  let chains = map(keys(chainsList), (c) => chainsList[toNumber(c) as keyof typeof chainsList]);
  if (overrideChains) {
    chains = overrideChains;
  }

  return createConfig({
    connectors: concat(connectors, safe()),
    chains: chains as unknown as readonly [Chain, ...Chain[]],
    transports: transports(),
    ssr: true,
  });
};

export const chainsMap = (chainId?: number) =>
  chainId ? chainsList[chainId as SupportedChains] : (first(values(chainsList)) as ExtendedChain);

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

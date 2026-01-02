'use client';

import { chainsList } from '@hatsprotocol/config';
import { createConfig as privyCreateConfig } from '@privy-io/wagmi';
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
  uniswapWallet,
  walletConnectWallet,
  zerionWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { concat, each, keys, map, toNumber } from 'lodash';
import { ExtendedChain } from 'types';
import { Chain, http, Transport } from 'viem';
import { createConfig } from 'wagmi';
import { safe } from 'wagmi/connectors';

import { getRpcUrl } from './chains-server';

type WagmiConfig = ReturnType<typeof createConfig>;
type PrivyConfig = ReturnType<typeof privyCreateConfig>;

const wagmiConfigCache = new Map<string, WagmiConfig>();
const privyConfigCache = new Map<string, PrivyConfig>();
const transportsCache = new Map<string, { [key: string]: Transport }>();
let cachedConnectors: ReturnType<typeof connectorsForWallets> | null = null;

const getWCProjectId = () => {
  const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
  if (!WC_PROJECT_ID && typeof window !== 'undefined') {
    throw new Error('NEXT_PUBLIC_WC_PROJECT_ID is not set');
  }
  return WC_PROJECT_ID;
};

const getConnectors = () => {
  // Skip connector initialization during SSR to prevent browser API access
  if (typeof window === 'undefined') {
    return [];
  }

  if (cachedConnectors) {
    return cachedConnectors;
  }

  const WC_PROJECT_ID = getWCProjectId();
  if (!WC_PROJECT_ID) {
    // eslint-disable-next-line no-console
    console.warn('NEXT_PUBLIC_WC_PROJECT_ID not set, wallet connections may not work properly');
    return [];
  }

  cachedConnectors = connectorsForWallets(
    [
      {
        groupName: 'Recommended',
        wallets: [coinbaseWallet, rainbowWallet],
      },
      {
        groupName: 'All',
        wallets: [
          injectedWallet,
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

  return cachedConnectors;
};

const getChainIds = (overrideChains?: (Chain | ExtendedChain)[]) => {
  if (overrideChains) {
    return overrideChains.map((chain) => chain.id);
  }

  return map(keys(chainsList), (c) => toNumber(c));
};

const getChains = (overrideChains?: (Chain | ExtendedChain)[]) => {
  if (overrideChains) {
    return overrideChains as ExtendedChain[];
  }

  return map(keys(chainsList), (c) => chainsList[toNumber(c) as keyof typeof chainsList]);
};

/**
 * Builds or reuses cached transports for the provided chain IDs.
 */
const getTransports = (chainIds: number[]) => {
  const cacheKey = chainIds.join(',');
  const cached = transportsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const localTransports: { [key: string]: Transport } = {};
  each(chainIds, (chainId) => {
    localTransports[chainId as keyof typeof localTransports] = http(getRpcUrl(toNumber(chainId)) as string, {
      batch: {
        // Batch multiple RPC calls into single multicall requests
        // This reduces the number of requests to the RPC provider
        wait: 50, // Wait 50ms to collect calls before batching
      },
    });
  });

  transportsCache.set(cacheKey, localTransports);
  return localTransports;
};

/**
 * Builds a stable cache key for wagmi/privy config variants.
 */
const getConfigCacheKey = (chainIds: number[], configType: 'wagmi' | 'privy') => {
  const environment = typeof window === 'undefined' ? 'ssr' : 'client';
  return `${configType}:${environment}:${chainIds.join(',')}`;
};

/**
 * Returns a cached wagmi config instance keyed by chains and runtime environment.
 */
export const wagmiConfig = (overrideChains?: (Chain | ExtendedChain)[]) => {
  const chainIds = getChainIds(overrideChains);
  const cacheKey = getConfigCacheKey(chainIds, 'wagmi');
  const cached = wagmiConfigCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const chains = getChains(overrideChains);
  const config = createConfig({
    connectors: concat(getConnectors(), safe()),
    chains: chains as unknown as readonly [Chain, ...Chain[]],
    transports: getTransports(chainIds),
    ssr: true,
  });

  wagmiConfigCache.set(cacheKey, config);
  return config;
};

/**
 * Returns a cached Privy wagmi config instance keyed by chains and runtime environment.
 */
export const privyConfig = (overrideChains?: Chain[]) => {
  const chainIds = getChainIds(overrideChains);
  const cacheKey = getConfigCacheKey(chainIds, 'privy');
  const cached = privyConfigCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const chains = getChains(overrideChains);
  const config = privyCreateConfig({
    chains: chains as unknown as readonly [Chain, ...Chain[]],
    transports: getTransports(chainIds),
    ssr: true,
  });

  privyConfigCache.set(cacheKey, config);
  return config;
};

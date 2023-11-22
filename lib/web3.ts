import '@rainbow-me/rainbowkit/styles.css';

import { HatsModulesClient } from '@hatsprotocol/modules-sdk';
import { HatsClient } from '@hatsprotocol/sdk-v1-core';
import { HatsSubgraphClient } from '@hatsprotocol/sdk-v1-subgraph';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { createConfig } from 'wagmi';

import { chains, chainsMap, publicClient } from './chains';

// app-utils

const { connectors } = getDefaultWallets({
  appName: 'Hats',
  chains,
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '',
});

export const wagmiConfig = createConfig({
  connectors,
  publicClient,
});

export function createHatsClient(
  chainId: number | undefined,
): HatsClient | undefined {
  if (!chainId) return undefined;
  const chain = chainsMap(chainId);

  const publicClientHats = createPublicClient({
    chain,
    transport: http(),
  });

  const walletClientHats = createWalletClient({
    chain,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transport: custom((window as any).ethereum),
  });

  const hatsClient = new HatsClient({
    chainId,
    publicClient: publicClientHats,
    walletClient: walletClientHats,
  });

  return hatsClient;
}

export function createSubgraphClient(): HatsSubgraphClient {
  return new HatsSubgraphClient({});
}

export async function createHatsModulesClient(
  chainId: number | undefined,
): Promise<HatsModulesClient | undefined> {
  if (!chainId) return undefined;
  const chain = chainsMap(chainId);

  const walletClientHats = createWalletClient({
    chain,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    transport: custom(window.ethereum),
  });

  const publicClientHats = createPublicClient({
    chain,
    transport: http(),
  });

  const hatsModulesClient = new HatsModulesClient({
    publicClient: publicClientHats,
    walletClient: walletClientHats,
  });

  await hatsModulesClient.prepare();

  return hatsModulesClient as HatsModulesClient;
}

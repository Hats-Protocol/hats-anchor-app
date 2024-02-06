import '@rainbow-me/rainbowkit/styles.css';

import { HatsSignerGateClient } from '@hatsprotocol/hsg-sdk';
import { HatsModulesClient } from '@hatsprotocol/modules-sdk';
import { HatsClient } from '@hatsprotocol/sdk-v1-core';
import { HatsSubgraphClient } from '@hatsprotocol/sdk-v1-subgraph';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { chainsList, NETWORK_ENDPOINTS } from 'app-constants';
import _ from 'lodash';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { createConfig } from 'wagmi';

import { chains, chainsMap, explorerUrl, publicClient } from './chains';

export { chains, chainsList, chainsMap, explorerUrl, publicClient };

const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;

const { connectors } = getDefaultWallets({
  appName: 'Hats',
  chains,
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '',
});

// workaround for https://github.com/microsoft/TypeScript/issues/48212
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const wagmiConfig: any = createConfig({
  connectors,
  publicClient,
});

// workaround for https://github.com/microsoft/TypeScript/issues/48212
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const viemPublicClient: any = (chainId: number) => {
  const chain = chainsMap(chainId);
  let transportUrl = _.first(_.get(chain, 'rpcUrls.default.http'));
  const alchemyUrl = _.get(chain, 'rpcUrls.alchemy.http');
  if (alchemyUrl) transportUrl = `${alchemyUrl}/${ALCHEMY_ID}`;

  return createPublicClient({
    chain,
    transport: http(transportUrl, { batch: true }),
  });
};

export function createHatsClient(
  chainId: number | undefined,
): HatsClient | undefined {
  if (!chainId) return undefined;
  const chain = chainsMap(chainId);

  const localPublicClient = viemPublicClient(chainId);

  const localWalletClient = createWalletClient({
    chain,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transport: custom((window as any).ethereum),
  });

  const hatsClient = new HatsClient({
    chainId,
    publicClient: localPublicClient,
    walletClient: localWalletClient,
  });

  return hatsClient;
}

export function createSubgraphClient(): HatsSubgraphClient {
  if (process.env.NODE_ENV === 'development') {
    return new HatsSubgraphClient({});
  }

  return new HatsSubgraphClient({ config: NETWORK_ENDPOINTS });
}

export async function createHatsModulesClient(
  chainId: number | undefined,
): Promise<HatsModulesClient | undefined> {
  if (!chainId) return undefined;
  const chain = chainsMap(chainId);

  const localWalletClient = createWalletClient({
    chain,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transport: custom((window as any).ethereum),
  });

  const localPublicClient = viemPublicClient(chainId);

  const hatsModulesClient = new HatsModulesClient({
    publicClient: localPublicClient,
    walletClient: localWalletClient,
  });

  await hatsModulesClient.prepare();

  return hatsModulesClient as HatsModulesClient;
}

export async function createHatsSignerGateClient(
  chainId: number | undefined,
): Promise<HatsSignerGateClient | undefined> {
  if (!chainId) return undefined;
  const chain = chainsMap(chainId);

  const localWalletClient = createWalletClient({
    chain,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transport: custom((window as any).ethereum),
  });

  const localPublicClient = viemPublicClient(chainId);

  const hatsModulesClient = new HatsSignerGateClient({
    publicClient: localPublicClient,
    walletClient: localWalletClient,
  });

  return hatsModulesClient as HatsSignerGateClient;
}

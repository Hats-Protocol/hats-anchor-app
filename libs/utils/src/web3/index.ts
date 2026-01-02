import { NETWORK_ENDPOINTS } from '@hatsprotocol/config';
import { HatsAccount1ofNClient } from '@hatsprotocol/hats-account-sdk';
import { HatsSignerGateClient } from '@hatsprotocol/hsg-sdk';
import { HatsModulesClient } from '@hatsprotocol/modules-sdk';
import { HatsClient } from '@hatsprotocol/sdk-v1-core';
import { HatsSubgraphClient } from '@hatsprotocol/sdk-v1-subgraph';
import { createPublicClient, http, PublicClient, WalletClient } from 'viem';
import { getWalletClient } from 'wagmi/actions';

import { wagmiConfig } from './chains';
import { chainsMap, getRpcUrl } from './chains-server';

const getWCProjectId = () => {
  const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
  if (!WC_PROJECT_ID && typeof window !== 'undefined') {
    throw new Error('NEXT_PUBLIC_WC_PROJECT_ID is not set');
  }
  return WC_PROJECT_ID;
};

declare global {
  interface Window {
    // @ts-expect-error - overlapping with definition from Coinbase wallet for some reason
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any;
  }
}

const hatsModulesClientCache = new Map<string, HatsModulesClient>();
const hatsModulesClientPrepareCache = new Map<string, Promise<HatsModulesClient>>();

/**
 * Builds a stable cache key for HatsModulesClient instances.
 * Uses the wallet address when available to avoid mixing readonly and signer clients.
 */
const getHatsModulesCacheKey = (chainId: number, walletClient?: WalletClient) => {
  const walletAddress = walletClient?.account?.address;
  return `${chainId}:${walletAddress || 'readonly'}`;
};

/**
 * Returns a prepared HatsModulesClient, reusing cached instances and de-duping prepares.
 */
const getPreparedHatsModulesClient = async ({
  chainId,
  walletClient,
}: {
  chainId: number;
  walletClient?: WalletClient;
}): Promise<HatsModulesClient> => {
  const cacheKey = getHatsModulesCacheKey(chainId, walletClient);
  const cachedClient = hatsModulesClientCache.get(cacheKey);
  if (cachedClient) {
    return cachedClient;
  }

  const inFlight = hatsModulesClientPrepareCache.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const client = new HatsModulesClient({
    publicClient: viemPublicClient(chainId),
    walletClient,
  });

  const preparePromise = client
    .prepare()
    .then(() => {
      hatsModulesClientCache.set(cacheKey, client);
      hatsModulesClientPrepareCache.delete(cacheKey);
      return client;
    })
    .catch((error) => {
      hatsModulesClientPrepareCache.delete(cacheKey);
      throw error;
    });

  hatsModulesClientPrepareCache.set(cacheKey, preparePromise);
  return preparePromise;
};

export const viemPublicClient = (chainId: number): PublicClient => {
  return createPublicClient({
    chain: chainsMap(chainId),
    batch: {
      multicall: {
        batchSize: 1024,
        wait: 50,
      },
    },
    transport: http(getRpcUrl(chainId) as string, {
      batch: {
        batchSize: 100,
        wait: 50,
      },
    }),
  }) as PublicClient;
};

export async function createHatsClient(
  chainId: number | undefined,
  walletClient?: WalletClient | undefined,
): Promise<HatsClient | undefined> {
  if (!chainId) return undefined;

  const publicClient = viemPublicClient(chainId);

  const hatsClient = new HatsClient({
    chainId,
    publicClient,
    walletClient,
  });

  return hatsClient;
}

export function createSubgraphClient(): HatsSubgraphClient {
  if (process.env.NODE_ENV === 'development') {
    return new HatsSubgraphClient({});
  }

  return new HatsSubgraphClient({
    config: NETWORK_ENDPOINTS,
  });
}

export async function createHatsModulesClient(
  chainId: number | undefined,
  walletClient?: WalletClient | undefined, // required for write functions
): Promise<HatsModulesClient | null> {
  if (!chainId) return Promise.resolve(null);

  if (walletClient) {
    return getPreparedHatsModulesClient({ chainId, walletClient });
  }

  // Keep existing behavior: attempt to resolve a wallet client if one is available,
  // otherwise fall back to a readonly client.
  return getWalletClient(wagmiConfig())
    .then((resolvedWalletClient) => getPreparedHatsModulesClient({ chainId, walletClient: resolvedWalletClient }))
    .catch(async () => {
      return getPreparedHatsModulesClient({ chainId });
    });
}

export async function createHatsSignerGateClient(
  chainId: number | undefined,
  walletClient?: WalletClient | undefined,
): Promise<HatsSignerGateClient | undefined> {
  if (!chainId) return undefined;

  const publicClient = viemPublicClient(chainId);
  try {
    const hatsModulesClient = new HatsSignerGateClient({
      publicClient,
      walletClient,
    });

    return hatsModulesClient as HatsSignerGateClient;
  } catch {
    // expect an error when not connected to a wallet
    return new HatsSignerGateClient({
      publicClient,
    });
  }
}

export async function createHatsAccountClient(
  chainId: number | undefined,
  walletClient?: WalletClient | undefined,
): Promise<HatsAccount1ofNClient | undefined> {
  if (!chainId) return undefined;

  const publicClient = viemPublicClient(chainId);

  if (walletClient) {
    const hatsAccountClient = new HatsAccount1ofNClient({
      publicClient,
      walletClient,
    });

    return hatsAccountClient as HatsAccount1ofNClient;
  } else {
    // expect an error when not connected to a wallet
    return new HatsAccount1ofNClient({
      publicClient,
      // @ts-expect-error - walletClient should not be required // TODO fix
      walletClient: undefined,
    });
  }
}

export * from './chains';
export * from './chains-server';

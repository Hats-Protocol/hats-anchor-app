import { NETWORK_ENDPOINTS } from '@hatsprotocol/constants';
import { HatsAccount1ofNClient } from '@hatsprotocol/hats-account-sdk';
import { HatsSignerGateClient } from '@hatsprotocol/hsg-sdk';
import { HatsModulesClient } from '@hatsprotocol/modules-sdk';
import { HatsClient } from '@hatsprotocol/sdk-v1-core';
import { HatsSubgraphClient } from '@hatsprotocol/sdk-v1-subgraph';
import { createPublicClient, http, PublicClient, WalletClient } from 'viem';
import { getWalletClient } from 'wagmi/actions';

import { chainsMap, getRpcUrl, wagmiConfig } from './chains';

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!WC_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_WC_PROJECT_ID is not set');
}

declare global {
  interface Window {
    // @ts-expect-error - overlapping with definition from Coinbase wallet for some reason
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any;
  }
}

export const viemPublicClient = (chainId: number): PublicClient => {
  return createPublicClient({
    chain: chainsMap(chainId),
    batch: { multicall: true },
    transport: http(getRpcUrl(chainId) as string, { batch: true }),
  }) as PublicClient;
};

export const viemWalletClient = async (chainId: number) => {
  return await getWalletClient(wagmiConfig());
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

  return new HatsSubgraphClient({ config: NETWORK_ENDPOINTS });
}

export async function createHatsModulesClient(
  chainId: number | undefined,
  walletClient?: WalletClient | undefined, // required for write functions
): Promise<HatsModulesClient | null> {
  if (!chainId) return Promise.resolve(null);

  const publicClient = viemPublicClient(chainId);

  if (walletClient) {
    const client = new HatsModulesClient({
      publicClient,
      walletClient,
    });
    await client.prepare();

    return Promise.resolve(client);
  }

  return getWalletClient(wagmiConfig())
    .then(async (walletClient) => {
      const hatsModulesClient = new HatsModulesClient({
        publicClient,
        walletClient,
      });

      // Will look up all modules in registry but can be configured to
      // handle a specific module if passed as argument
      await hatsModulesClient.prepare();

      return Promise.resolve(hatsModulesClient);
    })
    .catch(async (e) => {
      const modulesClient = new HatsModulesClient({
        publicClient,
      });

      await modulesClient.prepare();

      return Promise.resolve(modulesClient);
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
  } catch (e) {
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

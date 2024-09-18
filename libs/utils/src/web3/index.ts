import { NETWORK_ENDPOINTS } from '@hatsprotocol/constants';
import { HatsAccount1ofNClient } from '@hatsprotocol/hats-account-sdk';
import { HatsSignerGateClient } from '@hatsprotocol/hsg-sdk';
import { HatsModulesClient } from '@hatsprotocol/modules-sdk';
import { HatsClient } from '@hatsprotocol/sdk-v1-core';
import { HatsSubgraphClient } from '@hatsprotocol/sdk-v1-subgraph';
import { createPublicClient, http } from 'viem';
import { getWalletClient } from 'wagmi/actions';

import { chainsMap, getRpcUrl, wagmiConfig } from './chains';

declare global {
  interface Window {
    // @ts-expect-error - overlapping with definition from Coinbase wallet for some reason
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any;
  }
}

export const viemPublicClient = (chainId: number) => {
  return createPublicClient({
    chain: chainsMap(chainId),
    transport: http(getRpcUrl(chainId), { batch: true }),
  });
};

export async function createHatsClient(
  chainId: number | undefined,
): Promise<HatsClient | undefined> {
  if (!chainId) return undefined;

  const publicClient = viemPublicClient(chainId);
  const walletClient = await getWalletClient(wagmiConfig);

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
): Promise<HatsModulesClient | undefined> {
  if (!chainId) return undefined;

  const publicClient = viemPublicClient(chainId);
  try {
    const walletClient = await getWalletClient(wagmiConfig);

    const hatsModulesClient = new HatsModulesClient({
      publicClient,
      walletClient,
    });

    await hatsModulesClient.prepare();

    return hatsModulesClient as HatsModulesClient;
  } catch (e) {
    // expect an error when not connected to a wallet
    const modulesClient = new HatsModulesClient({
      publicClient,
    });

    await modulesClient.prepare();

    return modulesClient as HatsModulesClient;
  }
}

export async function createHatsSignerGateClient(
  chainId: number | undefined,
): Promise<HatsSignerGateClient | undefined> {
  if (!chainId) return undefined;

  const publicClient = viemPublicClient(chainId);
  try {
    const walletClient = await getWalletClient(wagmiConfig);

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
): Promise<HatsAccount1ofNClient | undefined> {
  if (!chainId) return undefined;

  const publicClient = viemPublicClient(chainId);
  try {
    const walletClient = await getWalletClient(wagmiConfig);

    const hatsAccountClient = new HatsAccount1ofNClient({
      publicClient,
      walletClient,
    });

    return hatsAccountClient as HatsAccount1ofNClient;
  } catch (e) {
    // expect an error when not connected to a wallet
    return new HatsAccount1ofNClient({
      publicClient,
      // @ts-expect-error - walletClient should not be required // TODO fix
      walletClient: undefined,
    });
  }
}

export * from './chains';

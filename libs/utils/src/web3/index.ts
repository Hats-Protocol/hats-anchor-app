// import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import // argentWallet,
// braveWallet,
// coinbaseWallet,
// dawnWallet,
// frameWallet,
// injectedWallet,
// ledgerWallet,
// metaMaskWallet,
// rabbyWallet,
// rainbowWallet,
// safeWallet,
// uniswapWallet,
// walletConnectWallet,
// zerionWallet,
'@rainbow-me/rainbowkit/wallets';

import { chainsList, NETWORK_ENDPOINTS } from '@hatsprotocol/constants';
import { HatsAccount1ofNClient } from '@hatsprotocol/hats-account-sdk';
import { HatsSignerGateClient } from '@hatsprotocol/hsg-sdk';
import { HatsModulesClient } from '@hatsprotocol/modules-sdk';
import { HatsClient } from '@hatsprotocol/sdk-v1-core';
import { HatsSubgraphClient } from '@hatsprotocol/sdk-v1-subgraph';
import _ from 'lodash';
import { createPublicClient, createWalletClient, custom, http } from 'viem';

import { chainsMap } from './chains';

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!WC_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_WC_PROJECT_ID is not set');
}
const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;
if (!ALCHEMY_ID) {
  throw new Error('NEXT_PUBLIC_ALCHEMY_ID is not set');
}

declare global {
  interface Window {
    // @ts-expect-error - overlapping with definition from Coinbase wallet for some reason
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any;
  }
}

const getRpcUrl = (chainId: number) => {
  const chain = chainsMap(chainId);
  let transportUrl = _.first(_.get(chain, 'rpcUrls.default.http'));
  const alchemyUrl = _.get(chain, 'rpcUrls.alchemy.http');
  if (alchemyUrl) transportUrl = `${alchemyUrl}/${ALCHEMY_ID}`;

  return transportUrl as string;
};

export const viemPublicClient = (chainId: number) => {
  return createPublicClient({
    chain: chainsMap(chainId),
    transport: http(getRpcUrl(chainId), { batch: true }),
  });
};

export function createHatsClient(
  chainId: number | undefined,
): HatsClient | undefined {
  if (!chainId) return undefined;
  const chain = chainsMap(chainId);

  const localPublicClient = viemPublicClient(chainId);
  let localWalletClient;
  if (window.ethereum) {
    localWalletClient = createWalletClient({
      chain,
      transport: custom(window.ethereum),
    });
  }
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
    transport: custom(window.ethereum),
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
    transport: custom(window.ethereum),
  });

  const localPublicClient = viemPublicClient(chainId);

  const hatsModulesClient = new HatsSignerGateClient({
    publicClient: localPublicClient,
    walletClient: localWalletClient,
  });

  return hatsModulesClient as HatsSignerGateClient;
}

export async function createHatsAccountClient(
  chainId: number | undefined,
): Promise<HatsAccount1ofNClient | undefined> {
  if (!chainId) return undefined;
  const chain = chainsMap(chainId);

  const localWalletClient = createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });

  const localPublicClient = viemPublicClient(chainId);

  const hatsAccountClient = new HatsAccount1ofNClient({
    publicClient: localPublicClient,
    walletClient: localWalletClient,
  });

  return hatsAccountClient as HatsAccount1ofNClient;
}

export { chainsList, getRpcUrl };
export * from './chains';

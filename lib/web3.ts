import '@rainbow-me/rainbowkit/styles.css';

import { HatsModulesClient } from '@hatsprotocol/modules-sdk';
import { HatsClient } from '@hatsprotocol/sdk-v1-core';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { alchemyProvider } from '@wagmi/core/providers/alchemy';
import { publicProvider } from '@wagmi/core/providers/public';
import _ from 'lodash';
import {
  createPublicClient,
  createWalletClient,
  custom,
  Hex,
  http,
} from 'viem';
import { Chain, configureChains, createConfig } from 'wagmi';
import {
  arbitrum,
  gnosis,
  goerli,
  mainnet,
  optimism,
  polygon,
} from 'wagmi/chains';

const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;

// can we use the defaults here again?
export const networkImages: { [key: number]: string } = {
  1: '/chains/ethereum.svg',
  5: '/chains/ethereum.svg',
  10: '/chains/optimism.svg',
  100: '/chains/gnosis.png',
  137: '/chains/polygon.svg',
  42161: '/chains/arbitrum.svg',
};

// TODO check if this got fixed, submit issue if not (should be fixed)
// gnosis chain object from wagmi doesn't include multicall contract details. This is a temporary fix
const gnosisContract = {
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11' as Hex,
      blockCreated: 21022491,
    },
  },
  // TODO where did the defaults go?
  hasIcon: true,
  iconUrl: networkImages[100],
  iconBackground: 'none',
};

// ORDER HERE WILL BE USED IN THE UI
export const orderedChains = [1, 10, 42161, 137, 100, 5];

export const chainsList: { [key: number]: Chain } = {
  1: mainnet,
  5: goerli,
  10: optimism,
  100: { ...gnosisContract, ...gnosis },
  137: polygon,
  42161: arbitrum,
  // 11155111: sepolia,
};

export const chainsMap = (chainId?: number) =>
  chainId ? chainsList[chainId] : chainsList[5];

export const explorerUrl = (chainId?: number) =>
  chainId &&
  (chainsMap(chainId)?.blockExplorers?.etherscan?.url ||
    chainsMap(chainId)?.blockExplorers?.default.url);

export const { chains, publicClient } = configureChains(_.values(chainsList), [
  alchemyProvider({ apiKey: ALCHEMY_ID || '' }),
  publicProvider(),
]);

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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    transport: custom(window.ethereum),
  });

  const hatsClient = new HatsClient({
    chainId,
    publicClient: publicClientHats,
    walletClient: walletClientHats,
  });

  return hatsClient;
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

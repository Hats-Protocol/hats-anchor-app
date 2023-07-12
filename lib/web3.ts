import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { alchemyProvider } from '@wagmi/core/providers/alchemy';
// import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc';
import { publicProvider } from '@wagmi/core/providers/public';
import _ from 'lodash';
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

export const networkImages: { [key: number]: string } = {
  1: '/chains/ethereum.svg',
  5: '/chains/ethereum.svg',
  10: '/chains/optimism.svg',
  100: '/chains/gnosis.png',
  137: '/chains/polygon.svg',
  42161: '/chains/arbitrum.svg',
};

// gnosis chain object from wagmi doesn't include multicall contract details. This is a temporary fix
const gnosisContract = {
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11' as `0x${string}`,
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

export const explorerUrl = (chainId: number) => {
  const explorerUrls: { [key: number]: string } = {
    1: mainnet.blockExplorers.etherscan.url,
    5: goerli.blockExplorers.etherscan.url,
    10: optimism.blockExplorers.etherscan.url,
    100: gnosis.blockExplorers.etherscan.url,
    137: polygon.blockExplorers.etherscan.url,
    42161: arbitrum.blockExplorers.etherscan.url,
    // 11155111: sepolia.blockExplorers.etherscan.url,
  };

  let url = explorerUrls[chainId] || explorerUrls[5];
  // TODO remove with fix to @wagmi/chains
  if (_.endsWith(url, '/')) {
    url = url?.slice(0, -1);
  }
  return url;
};

export const chainsMap = (chainId: number) =>
  chainsList[chainId] || chainsList[5];

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

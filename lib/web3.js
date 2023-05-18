import _ from 'lodash';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import {
  mainnet,
  goerli,
  polygon,
  gnosis,
  optimism,
  arbitrum,
  // sepolia,
} from 'wagmi/chains';
import { alchemyProvider } from '@wagmi/core/providers/alchemy';
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc';
import { publicProvider } from '@wagmi/core/providers/public';

import '@rainbow-me/rainbowkit/styles.css';

const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;

export const networkImages = {
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
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 21022491,
    },
  },
  // TODO where did the defaults go?
  hasIcon: true,
  iconUrl: networkImages[100],
  iconBackground: 'none',
};

export const chainsList = {
  1: mainnet,
  5: goerli,
  10: optimism,
  100: { ...gnosisContract, ...gnosis },
  137: polygon,
  42161: arbitrum,
  // 11155111: sepolia,
};

export const chainsMap = (chainId) => chainsList[chainId] || chainsList[5];

export const chainsColors = (chainId) => {
  const colors = {
    // 1: '#000000',
    5: 'blue',
    100: 'green',
    137: 'purple',
  };

  return colors[chainId] || colors[5];
};

export const { chains, publicClient } = configureChains(_.values(chainsList), [
  alchemyProvider({ apiKey: ALCHEMY_ID || '' }),
  publicProvider(),
  jsonRpcProvider({
    rpc: (localChain) => ({
      http: localChain.rpcUrls.default,
    }),
  }),
]);

const { connectors } = getDefaultWallets({
  appName: 'Hats',
  chains,
});

export const wagmiClient = createConfig({
  // autoConnect: true,
  connectors,
  publicClient,
});

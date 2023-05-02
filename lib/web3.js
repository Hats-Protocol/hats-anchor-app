import _ from 'lodash';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createClient } from 'wagmi';
import {
  mainnet,
  goerli,
  polygon,
  gnosis,
  optimism,
  arbitrum,
  // sepolia,
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

import '@rainbow-me/rainbowkit/styles.css';

const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;

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
  iconUrl: '/chains/gnosis.png',
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

export const { chains, provider } = configureChains(_.values(chainsList), [
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

export const wagmiClient = createClient({
  // autoConnect: true,
  connectors,
  provider,
});

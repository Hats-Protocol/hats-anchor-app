import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createClient } from 'wagmi';
import { goerli, polygon, gnosis } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import '@rainbow-me/rainbowkit/styles.css';

const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;

// todo add mainnet
export const chainsMap = (chainId) => {
  const chainsList = {
    // 1: mainnet,
    5: goerli,
    100: gnosis,
    137: polygon,
  };

  return chainsList[chainId] || chainsList[5];
};

export const chainsColors = (chainId) => {
  const colors = {
    // 1: '#000000',
    5: 'blue',
    100: 'green',
    137: 'purple',
  };

  return colors[chainId] || colors[5];
};

export const { chains, provider } = configureChains(
  [goerli, gnosis, polygon],
  [
    alchemyProvider({ apiKey: ALCHEMY_ID || '' }),
    jsonRpcProvider({
      rpc: (localChain) => ({
        http: localChain.rpcUrls.default,
      }),
    }),
  ],
);

const { connectors } = getDefaultWallets({
  appName: 'Hats',
  chains,
});

export const wagmiClient = createClient({
  // autoConnect: true,
  connectors,
  provider,
});

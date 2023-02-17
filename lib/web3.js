import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createClient } from 'wagmi';
import { goerli } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';

import '@rainbow-me/rainbowkit/styles.css';

const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;

export const chainsMap = (chainId) => {
  const chainsList = {
    5: goerli,
  };

  return chainsList[chainId] || chainsList[5];
};

export const { chains, provider } = configureChains(
  [goerli],
  [
    alchemyProvider({ apiKey: ALCHEMY_ID || '' }),
    // jsonRpcProvider({
    //   rpc: (localChain: any) => ({
    //     http: localChain.rpcUrls.default,
    //   }),
    // }),
    // publicProvider(),
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

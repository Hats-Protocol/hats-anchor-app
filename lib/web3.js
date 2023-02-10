import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createClient } from 'wagmi';
import { mainnet, goerli, polygon } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';

import '@rainbow-me/rainbowkit/styles.css';

const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;

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

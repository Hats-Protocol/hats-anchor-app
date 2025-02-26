'use client';

import { chainsList, councilsChainsList } from '@hatsprotocol/config';
import { createConfig as privyCreateConfig } from '@privy-io/wagmi';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  braveWallet,
  coinbaseWallet,
  dawnWallet,
  frameWallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  uniswapWallet,
  walletConnectWallet,
  zerionWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { concat, each, keys, map, toNumber } from 'lodash';
import { Chain, http, Transport } from 'viem';
import { createConfig } from 'wagmi';
import { safe } from 'wagmi/connectors';

import { getRpcUrl } from './chains-server';

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!WC_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_WC_PROJECT_ID is not set');
}

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [coinbaseWallet, rainbowWallet],
    },
    {
      groupName: 'All',
      wallets: [
        injectedWallet,
        safeWallet,
        argentWallet,
        braveWallet,
        walletConnectWallet,
        dawnWallet,
        frameWallet,
        ledgerWallet,
        metaMaskWallet,
        rabbyWallet,
        uniswapWallet,
        zerionWallet,
      ],
    },
  ],
  {
    appName: 'Hats App',
    projectId: WC_PROJECT_ID,
  },
);

const transports = () => {
  const localTransports: { [key: string]: Transport } = {};
  each(chainsList, (chain, chainId) => {
    localTransports[chainId as keyof typeof localTransports] = http(getRpcUrl(toNumber(chainId)) as string);
  });

  return localTransports;
};

export const wagmiConfig = (overrideChains?: Chain[]) => {
  let chains = map(keys(chainsList), (c) => chainsList[toNumber(c) as keyof typeof chainsList]);
  if (overrideChains) {
    chains = overrideChains;
  }

  return createConfig({
    connectors: concat(connectors, safe()),
    chains: chains as unknown as readonly [Chain, ...Chain[]],
    transports: transports(),
    ssr: true,
  });
};

export const privyConfig = (overrideChains?: Chain[]) => {
  let chains = map(
    keys(councilsChainsList),
    (c) => councilsChainsList[toNumber(c) as keyof typeof councilsChainsList],
  ) as Chain[];
  if (overrideChains) {
    chains = overrideChains;
  }

  return privyCreateConfig({
    chains: chains as unknown as readonly [Chain, ...Chain[]],
    transports: transports(),
    ssr: true,
  });
};

'use client';

import { chainsList } from '@hatsprotocol/constants';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  braveWallet,
  coinbaseWallet,
  dawnWallet,
  frameWallet,
  injectedWallet,
  ledgerWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  uniswapWallet,
  walletConnectWallet,
  zerionWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { concat, each, first, get, has, keys, map, toNumber, values } from 'lodash';
import { SupportedChains } from 'types';
import { Chain, http, Transport } from 'viem';
import { createConfig } from 'wagmi';
import { safe } from 'wagmi/connectors';

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!WC_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_WC_PROJECT_ID is not set');
}
const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;
if (!ALCHEMY_ID) {
  throw new Error('NEXT_PUBLIC_ALCHEMY_ID is not set');
}

const RPC_URLS: { [key: number]: string } = {
  1: process.env.NEXT_PUBLIC_MAINNET_HTTP_PROVIDER,
  10: process.env.NEXT_PUBLIC_OPTIMISM_HTTP_PROVIDER,
  100: process.env.NEXT_PUBLIC_GNOSIS_HTTP_PROVIDER,
  137: process.env.NEXT_PUBLIC_POLYGON_HTTP_PROVIDER,
  8453: process.env.NEXT_PUBLIC_BASE_HTTP_PROVIDER,
  42220: process.env.NEXT_PUBLIC_CELO_HTTP_PROVIDER,
  42161: process.env.NEXT_PUBLIC_ARBITRUM_HTTP_PROVIDER,
  11155111: process.env.NEXT_PUBLIC_SEPOLIA_HTTP_PROVIDER,
};

export const getRpcUrl = (chainId: number) => {
  if (!has(RPC_URLS, chainId)) {
    const chain = chainsMap(chainId);
    return first(get(chain, 'rpcUrls.default.http'));
  }

  return get(RPC_URLS, chainId);
};

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
        // metaMaskWallet,
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
    localTransports[chainId as keyof typeof localTransports] = http(
      getRpcUrl(toNumber(chainId)),
    );
  });

  return localTransports;
};

export const wagmiConfig = createConfig({
  connectors: concat(connectors, safe()),
  chains: map(
    keys(chainsList),
    (c) => chainsList[toNumber(c) as keyof typeof chainsList],
  ) as unknown as readonly [Chain, ...Chain[]], // TODO any better way to do this?
  transports: transports(),
  ssr: true,
});

export const chainsMap = (chainId?: number) =>
  chainId
    ? chainsList[chainId as SupportedChains]
    : (first(values(chainsList)) as Chain);

export const explorerUrl = (chainId?: number) =>
  chainId &&
  get(
    chainsMap(chainId),
    'blockExplorers.etherscan.url',
    get(chainsMap(chainId), 'blockExplorers.default.url'),
  );

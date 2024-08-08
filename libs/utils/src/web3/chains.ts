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
  1: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
  10: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
  100: `https://rpc.gnosischain.com`,
  137: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
  8453: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
  42220: 'https://forno.celo.org', // `https://celo-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
  42161: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
  11155111: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_ID}`,
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

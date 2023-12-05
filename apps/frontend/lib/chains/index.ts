import { alchemyProvider } from '@wagmi/core/providers/alchemy';
import { publicProvider } from '@wagmi/core/providers/public';
import _ from 'lodash';
import { Hex } from 'viem';
import { configureChains } from 'wagmi';
import {
  arbitrum,
  // base,
  // baseSepolia,
  // celo,
  Chain,
  gnosis,
  goerli,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

import pgn from './pgn';

const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;

export type SupportedChains = 1 | 5 | 10 | 100 | 137 | 424 | 42161 | 11155111; // 42220, 8453 // 84532
// ORDER HERE WILL BE USED IN THE UI
export const orderedChains = [1, 10, 42161, 137, 100, 424, 11155111, 5]; // 42220, 8453 // 84532

// can we use the defaults here again?
export const networkImages: { [key in SupportedChains]: string } = {
  1: '/chains/ethereum.svg',
  5: '/chains/ethereum.svg',
  10: '/chains/optimism.svg',
  100: '/chains/gnosis.png',
  137: '/chains/polygon.svg',
  424: '/chains/pgn.png',
  // 8453: '/chains/base.svg',
  42161: '/chains/arbitrum.svg',
  // 42220: '/chains/celo.svg',
  // 84532: '/chains/base-sepolia.svg',
  11155111: '/chains/ethereum.svg',
};

// TODO check if this got fixed, submit issue if not (should be fixed)
// gnosis chain object from wagmi doesn't include multicall contract details. This is a temporary fix
const customGnosis = {
  ...gnosis,
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11' as Hex,
      blockCreated: 21022491,
    },
  },
  hasIcon: true,
  iconUrl: networkImages[100],
  iconBackground: 'none',
};

export const chainsList: { [key in SupportedChains]: Chain } = {
  1: mainnet,
  5: goerli,
  10: optimism,
  100: customGnosis,
  137: polygon,
  424: pgn,
  // 8453: base,
  42161: arbitrum,
  // 42220: celo,
  // 84532: baseSepolia,
  11155111: sepolia,
};

export const chainsMap = (chainId?: number) =>
  chainId ? chainsList[chainId as SupportedChains] : chainsList[5];

export const explorerUrl = (chainId?: number) =>
  chainId &&
  _.get(
    chainsMap(chainId),
    'blockExplorers.etherscan.url',
    _.get(chainsMap(chainId), 'blockExplorers.default.url'),
  );

export const { chains, publicClient } = configureChains(_.values(chainsList), [
  alchemyProvider({ apiKey: ALCHEMY_ID || '' }),
  publicProvider(),
]);

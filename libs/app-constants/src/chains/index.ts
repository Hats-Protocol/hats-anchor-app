import { SupportedChains } from 'hats-types';
import {
  arbitrum,
  base,
  celo as defaultCelo,
  // baseSepolia,
  Chain,
  gnosis as defaultGnosis,
  goerli,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

import pgn from './pgn';

// ORDER HERE WILL BE USED IN THE UI
export const orderedChains = [
  // main networks
  1, // mainnet
  10, // optimism
  42161, // arbitrum
  137, // polygon
  100, // gnosis
  8453, // base
  42220, // celo
  424, // pgn
  // testnets
  11155111, // sepolia
  5, // goerli
  // 84532 // baseSepolia
];

// can we use the defaults here again?
export const networkImages: { [key in SupportedChains]: string } = {
  1: '/chains/ethereum.svg',
  5: '/chains/ethereum.svg',
  10: '/chains/optimism.svg',
  100: '/chains/gnosis.png',
  137: '/chains/polygon.svg',
  424: '/chains/pgn.png',
  8453: '/chains/base.png',
  42161: '/chains/arbitrum.svg',
  42220: '/chains/celo.svg',
  // 84532: '/chains/base-sepolia.svg',
  11155111: '/chains/ethereum.svg',
};

const gnosis = {
  ...defaultGnosis,
  hasIcon: true,
  iconUrl: networkImages[100],
  iconBackground: 'none',
};

const celo = {
  ...defaultCelo,
  hasIcon: true,
  iconUrl: networkImages[42220],
  iconBackground: 'none',
};

export const chainsList: { [key in SupportedChains]: Chain } = {
  1: mainnet,
  10: optimism,
  42161: arbitrum,
  137: polygon,
  100: gnosis,
  424: pgn,
  8453: base,
  42220: celo,

  // TESTNETS
  5: goerli,
  11155111: sepolia,
  // 84532: baseSepolia,
};

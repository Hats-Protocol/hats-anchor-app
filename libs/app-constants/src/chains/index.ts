import { SupportedChains } from 'hats-types';
import { Hex } from 'viem';
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
  10: optimism,
  42161: arbitrum,
  137: polygon,
  100: customGnosis,
  424: pgn,

  // 8453: base,
  // 42220: celo,

  // TESTNETS
  5: goerli,
  11155111: sepolia,
  // 84532: baseSepolia,
};

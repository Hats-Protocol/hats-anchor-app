import { SupportedChains } from 'hats-types';
import {
  arbitrum,
  base,
  celo,
  // baseSepolia,
  Chain,
  gnosis,
  goerli,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

// ORDER HERE WILL BE USED IN THE UI
export const orderedChains: SupportedChains[] = [
  // main networks
  1, // mainnet
  10, // optimism
  42161, // arbitrum
  137, // polygon
  100, // gnosis
  8453, // base
  42220, // celo
  // testnets
  11155111, // sepolia
  5, // goerli
  // 84532 // baseSepolia
];

// celo and gnosis are missing images, also used by NetworkFilter
export const networkImages: { [key in SupportedChains]: string } = {
  1: '/chains/ethereum.svg',
  5: '/chains/ethereum.svg',
  10: '/chains/optimism.svg',
  100: '/chains/gnosis.png',
  137: '/chains/polygon.svg',
  8453: '/chains/base.png',
  42161: '/chains/arbitrum.svg',
  42220: '/chains/celo.svg',
  // 84532: '/chains/base-sepolia.svg',
  11155111: '/chains/ethereum.svg',
};

const extendIcon = (chain: Chain) => ({
  ...chain,
  hasIcon: true,
  iconUrl: networkImages[chain.id as SupportedChains],
  iconBackground: 'none',
});

export const chainsList: { [key in SupportedChains]: Chain } = {
  1: mainnet,
  10: optimism,
  42161: arbitrum,
  137: polygon,
  100: extendIcon(gnosis),
  8453: base,
  42220: extendIcon(celo),

  // TESTNETS
  5: goerli,
  11155111: sepolia,
  // 84532: baseSepolia,
};

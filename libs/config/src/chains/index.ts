import { ExtendedChain, SupportedChains } from 'types';
import { arbitrum, base, baseSepolia, celo, Chain, gnosis, mainnet, optimism, polygon, sepolia } from 'wagmi/chains';

// ORDER HERE WILL BE USED IN THE UI
export const ORDERED_CHAINS: SupportedChains[] = [
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
  84532, // baseSepolia
];

// celo and gnosis are missing images, also used by NetworkFilter
export const NETWORK_IMAGES: { [key in SupportedChains]: string } = {
  1: '/chains/ethereum.svg',
  10: '/chains/optimism.svg',
  100: '/chains/gnosis.png',
  137: '/chains/polygon.svg',
  8453: '/chains/base.png',
  42161: '/chains/arbitrum.svg',
  42220: '/chains/celo.svg',
  84532: '/chains/base.png',
  11155111: '/chains/sepolia.png',
};

const extendIcon = (chain: Chain) => ({
  ...chain,
  hasIcon: true,
  iconUrl: NETWORK_IMAGES[chain.id as SupportedChains],
  iconBackground: 'none',
});

export const chainsList: { [key in SupportedChains]: ExtendedChain } = {
  10: extendIcon(optimism),
  1: extendIcon(mainnet),
  100: extendIcon(gnosis),
  137: extendIcon(polygon),
  8453: extendIcon(base),
  42161: extendIcon(arbitrum),
  42220: extendIcon(celo),

  // TESTNETS
  84532: extendIcon(baseSepolia),
  11155111: extendIcon(sepolia),
};

export const NETWORK_CURRENCY: { [key: number]: string } = {
  1: 'ETH',
  10: 'ETH',
  100: 'xDai',
  137: 'MATIC',
  8453: 'ETH',
  42161: 'ETH',
  42220: 'CELO',

  // TESTNETS
  84532: 'ETH',
  11155111: 'ETH',
};

export const NETWORK_CURRENCY_IMAGE: { [key: number]: string } = {
  1: '/chains/ethereum.svg',
  10: '/chains/ethereum.svg',
  100: '/chains/xdai.png',
  137: '/chains/polygon.svg',
  8453: '/chains/ethereum.svg',
  42161: '/chains/ethereum.svg',
  42220: '/chains/celo.svg',

  // TESTNETS
  84532: '/chains/ethereum.svg',
  11155111: '/chains/ethereum.svg',
};

export const CHAIN_IDS: Record<string, SupportedChains> = {
  optimism: 10,
  base: 8453,
  arbitrum: 42161,
  polygon: 137,
  ethereum: 1,
  gnosis: 100,
  celo: 42220,
  sepolia: 11155111,
  baseSepolia: 84532,
} as const;

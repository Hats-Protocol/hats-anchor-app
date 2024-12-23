import { SupportedChains } from 'types';

export interface ChainOption {
  value: string;
  label: string;
  icon: string;
}

export const CHAIN_OPTIONS: ChainOption[] = [
  { value: 'optimism', label: 'Optimism', icon: '/chains/optimism.svg' },
  { value: 'base', label: 'Base', icon: '/chains/base.png' },
  { value: 'arbitrum', label: 'Arbitrum', icon: '/chains/arbitrum.svg' },
  { value: 'polygon', label: 'Polygon', icon: '/chains/polygon.svg' },
  { value: 'ethereum', label: 'Ethereum', icon: '/chains/ethereum.svg' },
  { value: 'gnosis', label: 'Gnosis', icon: '/chains/gnosis.png' },
  { value: 'celo', label: 'Celo', icon: '/chains/celo.svg' },
  { value: 'sepolia', label: 'Sepolia', icon: '/chains/sepolia.png' },
];

const CHAIN_IDS: Record<string, SupportedChains> = {
  optimism: 10,
  base: 8453,
  arbitrum: 42161,
  polygon: 137,
  ethereum: 1,
  gnosis: 100,
  celo: 42220,
  sepolia: 11155111,
} as const;

export function getChainId(chainValue: string): SupportedChains {
  return CHAIN_IDS[chainValue];
}

export const CHAIN_MAPPING = {
  '1': 'ethereum',
  '10': 'optimism',
  '42161': 'arbitrum',
  '137': 'polygon',
  '100': 'gnosis',
  '8453': 'base',
  '42220': 'celo',
  '11155111': 'sepolia',
} as const;

export const chainIdToString = (chainId: number | null): string | null => {
  if (!chainId) return null;
  return (
    CHAIN_MAPPING[chainId.toString() as keyof typeof CHAIN_MAPPING] || null
  );
};

export const chainStringToId = (chainString: string | null): number | null => {
  if (!chainString) return null;
  const entry = Object.entries(CHAIN_MAPPING).find(
    ([_, value]) => value === chainString,
  );
  return entry ? parseInt(entry[0]) : null;
};

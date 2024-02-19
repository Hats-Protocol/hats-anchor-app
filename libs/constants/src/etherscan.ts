import { SupportedChains } from 'hats-types';

const {
  ETHERSCAN_API_KEY,
  OPSCAN_API_KEY,
  POLYGONSCAN_API_KEY,
  GNOSISSCAN_API_KEY,
  ARBISCAN_API_KEY,
  BASESCAN_API_KEY,
  CELOSCAN_API_KEY,
} = process.env;

export const ETHERSCAN_API_URLS: {
  [key in SupportedChains]: string | undefined;
} = {
  1: 'https://api.etherscan.io/api',
  10: 'https://api-optimistic.etherscan.io/api',
  100: 'https://api.gnosisscan.io/api',
  137: 'https://api.polygonscan.com/api',
  8453: 'https://api.basescan.org/api',
  42161: 'https://api.arbiscan.io/api',
  42220: 'https://api.celoscan.io/api',
  11155111: 'https://api-sepolia.etherscan.io/api',
};

export const ETHERSCAN_KEYS: { [key in SupportedChains]: string | undefined } =
  {
    1: ETHERSCAN_API_KEY,
    10: OPSCAN_API_KEY,
    100: GNOSISSCAN_API_KEY,
    137: POLYGONSCAN_API_KEY,
    8453: BASESCAN_API_KEY,
    42161: ARBISCAN_API_KEY,
    42220: CELOSCAN_API_KEY,
    11155111: ETHERSCAN_API_KEY,
  };

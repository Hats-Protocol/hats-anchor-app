import { Chain } from '@wagmi/core';

const pgn = {
  id: 424,
  name: 'PGN',
  network: 'pgn',
  hasIcon: true,
  iconUrl: '/chains/pgn.png',
  iconBackground: 'none',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://rpc.publicgoods.network'] },
    default: { http: ['https://rpc.publicgoods.network'] },
  },
  blockExplorers: {
    etherscan: {
      name: 'PGN Explorer',
      url: 'https://explorer.publicgoods.network',
    },
    default: {
      name: 'PGN Explorer',
      url: 'https://explorer.publicgoods.network',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3_380_209,
    },
  },
} as Chain;

export const pgnSepolia = {
  id: 58008,
  name: 'Sepolia PGN',
  network: 'sepoliaPgn',
  hasIcon: true,
  iconUrl: '/chains/pgn.png',
  iconBackground: 'none',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.publicgoods.network'] },
    default: { http: ['https://sepolia.publicgoods.network'] },
  },
  blockExplorers: {
    etherscan: {
      name: 'Sepolia PGN Explorer',
      url: 'https://explorer.sepolia.publicgoods.network',
    },
    default: {
      name: 'Sepolia PGN Explorer',
      url: 'https://explorer.sepolia.publicgoods.network',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 3_380_209, // TODO figure out actual block
    },
  },
} as Chain;

export default pgn;

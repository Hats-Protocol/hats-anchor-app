export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const hatsAddresses = (chainId) => {
  const obj = {
    // 1: '0x95647f88dcbc12986046fc4f49064edd11a25d38',
    5: '0x96bD657Fcc04c71B47f896a829E5728415cbcAa1', // '0xB7019C3670F5d4dD99166727a7D29F8A16F4F20A',
    100: '0x96bD657Fcc04c71B47f896a829E5728415cbcAa1',
    137: '0x96bD657Fcc04c71B47f896a829E5728415cbcAa1',
  };

  return obj[chainId] || obj[5];
};

export const MODULE_TYPES = {
  eligibility: 'ELIGIBILITY',
  toggle: 'TOGGLE',
};

// TODO add mainnet
const CONFIG = {
  emojis: '🧢🎩👒',
  appName: 'Hats Protocol',
  shortName: 'Hats',
  url: 'https://app.hatsprotocol.xyz',
  logoUrl:
    'https://ipfs.io/ipfs/QmbQy4vsu4aAHuQwpHoHUsEURtiYKEbhv7ouumBXiierp9?filename=hats%20hat.jpg',
  chains: [5, 100, 137],
  debounce: 1500,
};

export default CONFIG;

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const FALLBACK_ADDRESS = '0x0000000000000000000000000000000000004a75';

// TODO create2 we can consolidate to 1 address
export const hatsAddresses = (chainId) => {
  // const obj = {
  //   1: '0x9d2dfd6066d5935267291718e8aa16c8ab729e9d',
  //   5: '0x9d2dfd6066d5935267291718e8aa16c8ab729e9d',
  //   10: '0x9d2dfd6066d5935267291718e8aa16c8ab729e9d',
  //   100: '0x9d2dfd6066d5935267291718e8aa16c8ab729e9d',
  //   137: '0x9d2dfd6066d5935267291718e8aa16c8ab729e9d',
  //   42161: '0x9d2dfd6066d5935267291718e8aa16c8ab729e9d',
  //   11155111: '0x9d2dfd6066d5935267291718e8aa16c8ab729e9d',
  // };

  return '0x9d2dfd6066d5935267291718e8aa16c8ab729e9d'; // obj[chainId] || obj[5];
};

export const MODULE_TYPES = {
  eligibility: 'ELIGIBILITY',
  toggle: 'TOGGLE',
};

const CONFIG = {
  emojis: '🧢🎩👒',
  appName: 'Hats Protocol',
  shortName: 'Hats',
  url: 'https://app.hatsprotocol.xyz',
  logoUrl:
    'https://ipfs.io/ipfs/QmbQy4vsu4aAHuQwpHoHUsEURtiYKEbhv7ouumBXiierp9?filename=hats%20hat.jpg',
  chains: [1, 5, 10, 100, 137, 42161, 11155111],
  debounce: 350,
};

export default CONFIG;

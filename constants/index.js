export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const FALLBACK_ADDRESS = '0x0000000000000000000000000000000000004a75';

// TODO create2 we can consolidate to 1 address
export const hatsAddresses = (chainId) => {
  const obj = {
    1: '0x850f3384829D7bab6224D141AFeD9A559d745E3D',
    5: '0x850f3384829D7bab6224D141AFeD9A559d745E3D',
    10: '0x850f3384829D7bab6224D141AFeD9A559d745E3D',
    100: '0x850f3384829D7bab6224D141AFeD9A559d745E3D',
    137: '0x850f3384829D7bab6224D141AFeD9A559d745E3D',
    42161: '0x850f3384829D7bab6224D141AFeD9A559d745E3D',
    11155111: '0x850f3384829D7bab6224D141AFeD9A559d745E3D',
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
  debounce: 350,
};

export default CONFIG;

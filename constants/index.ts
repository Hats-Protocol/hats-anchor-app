export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const FALLBACK_ADDRESS = '0x0000000000000000000000000000000000004a75';

export const MODULE_TYPES: { [key: string]: string } = {
  eligibility: 'ELIGIBILITY',
  toggle: 'TOGGLE',
};

const CONFIG: {
  [key: string]: any;
  hatsAddress: `0x${string}`;
} = {
  hatsAddress: '0x9d2dfd6066d5935267291718e8aa16c8ab729e9d',
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

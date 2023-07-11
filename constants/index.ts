export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const FALLBACK_ADDRESS = '0x0000000000000000000000000000000000004a75';

export const MODULE_TYPES: { [key: string]: string } = {
  eligibility: 'ELIGIBILITY',
  toggle: 'TOGGLE',
};

export const STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const MUTABILITY = {
  MUTABLE: 'Mutable',
  IMMUTABLE: 'Immutable',
};

const CONFIG: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  hatsAddress: `0x${string}`;
} = {
  hatsAddress: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137',
  emojis: '🧢🎩👒',
  appName: 'Hats Protocol',
  protocolVersion: '1.0',
  shortName: 'Hats',
  url: 'https://app.hatsprotocol.xyz',
  logoUrl:
    'https://indigo-selective-coral-505.mypinata.cloud/ipfs/QmbQy4vsu4aAHuQwpHoHUsEURtiYKEbhv7ouumBXiierp9?filename=hats%20hat.jpg',
  ipfsGateway: 'https://indigo-selective-coral-505.mypinata.cloud/ipfs/',
  chains: [1, 5, 10, 100, 137, 42161, 11155111],
  debounce: 350,
  banner: true,

  // terminology
  hat: 'hat',
  hats: 'hats',
  tree: 'tree',
  trees: 'trees',
  authority: 'authority',
  authorities: 'authorities',
  permission: 'permission',
  permissions: 'permissions',
  right: 'right',
  rights: 'rights',
  eligibility: 'eligibility',
  eligibilities: 'eligibilities',
  toggle: 'toggle',
  toggles: 'toggles',
  wearer: 'wearer',
  wearers: 'wearers',
};

export default CONFIG;

import { Abi, Hex } from 'viem';

import { HATS_ABI } from '@/contracts/Hats';

export { default as defaultHat } from './defaultHat';
export * from './form';
export * from './landingContent';
export * from './misc';
export * from './treeControls';

const CONFIG: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  hatsAbi: Abi;
  hatsAddress: Hex;
} = {
  hatsAddress: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137',
  hatsAbi: HATS_ABI as Abi,
  emojis: '🧢🎩👒',
  appName: 'Hats Protocol',
  protocolVersion: '1.0',
  shortName: 'Hats',
  url: 'https://app.hatsprotocol.xyz',
  logoUrl: 'https://app.hatsprotocol.xyz/img/favicon-512.png',
  ipfsGateway: 'https://indigo-selective-coral-505.mypinata.cloud/ipfs/',
  chains: [1, 5, 10, 100, 137, 42161, 11155111],
  debounce: 350,
  banner: false,
  claimsHatterModuleId:
    '0xa6736b79820695b7014d72937d271224ac9cd523d067bc271c5238cacfa8d16c',

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

  // docs
  docsLinks: {
    responsibilities:
      'https://docs.hatsprotocol.xyz/using-hats/setting-hat-properties',
    authorities:
      'https://docs.hatsprotocol.xyz/hats-integrations/hat-gated-authorities',
    eligibility:
      'https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/eligibility-requirements-for-wearers',
    toggle:
      'https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/toggle-activating-and-deactivating-hats',
  },
};

export default CONFIG;

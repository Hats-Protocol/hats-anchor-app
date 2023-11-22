import { Abi, Hex } from 'viem';

import { HATS_ABI } from '@/contracts/Hats';

import { CONTACT_URL, DOCS_URL } from './landingContent';

// constants lib or sub of app-utils

export { default as defaultHat } from './defaultHat';
export * from './form';
export * from './landingContent';
export * from './misc';
export * from './treeControls';

type Config = {
  hatsAbi: Abi;
  hatsAddress: Hex;
  modulesRegistryFactory: Hex;
  emojis: string;
  appName: string;
  protocolVersion: string;
  shortName: string;
  url: string;
  logoUrl: string;
  ipfsGateway: string;
  chains: number[];
  debounce: number;
  banner: boolean;
  claimsHatterModuleName: string;

  // terminology
  hat: string;
  hats: string;
  tree: string;
  trees: string;
  authority: string;
  authorities: string;
  permission: string;
  permissions: string;
  right: string;
  rights: string;
  eligibility: string;
  eligibilities: string;
  toggle: string;
  toggles: string;
  wearer: string;
  wearers: string;

  // docs
  DOCS_URL: string;
  CONTACT_URL: string;
  docsLinks: {
    responsibilities: string;
    authorities: string;
    eligibility: string;
    toggle: string;
  };
};

const CONFIG: Config = {
  hatsAddress: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137',
  hatsAbi: HATS_ABI as Abi,
  emojis: '🧢🎩👒',
  appName: 'Hats Protocol',
  protocolVersion: 'v1',
  shortName: 'Hats',
  url: 'https://app.hatsprotocol.xyz',
  logoUrl: 'https://app.hatsprotocol.xyz/img/favicon-512.png',
  ipfsGateway: process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://ipfs.io/ipfs/',
  chains: [1, 5, 10, 100, 137, 42161, 11155111],
  debounce: 350,
  banner: false,
  claimsHatterModuleName: 'Multi Claims Hatter',
  modulesRegistryFactory: '0xfE661c01891172046feE16D3a57c3Cf456729efA',
  DOCS_URL,
  CONTACT_URL,

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
    responsibilities: `${DOCS_URL}/using-hats/connecting-hats-w-authorities-and-responsibilities/documenting-hat-powers-and-responsibilities`,
    authorities: `${DOCS_URL}/hats-integrations/hat-gated-authorities`,
    eligibility: `${DOCS_URL}/using-hats/setting-accountabilities/eligibility-requirements-for-wearers`,
    toggle: `${DOCS_URL}/using-hats/setting-accountabilities/toggle-activating-and-deactivating-hats`,
  },
};

export default CONFIG;

import { Abi, Hex } from 'viem';

import { HATS_ABI } from './contracts';
import { CONTACT_URL, DOCS_URL } from './landingContent';
import { MINI_CONFIG } from './next-seo.config';

export * from './authorities';
export * from './chains';
export * from './contracts';
export { default as DEFAULT_HAT } from './defaultHat';
export * from './form';
export * from './ipfs';
export * from './landingContent';
export * from './misc';
export * from './modules';
export { default as SEO } from './next-seo.config';
export { default as PROPOSALS } from './spaces';
export { ANCILLARY_API_URL, default as NETWORK_ENDPOINTS } from './subgraph';
export * from './treeControls';

const APP_URL = 'https://app.hatsprotocol.xyz';

export const CONFIG: Config = {
  ...MINI_CONFIG,
  hatsAddress: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137',
  hatsAbi: HATS_ABI as Abi,
  emojis: '🧢🎩👒',
  protocolVersion: 'v1',
  shortName: 'Hats',
  ipfsGateway: process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://ipfs.io/ipfs/',
  chains: [1, 5, 10, 100, 137, 42161, 11155111],
  debounce: 350,
  banner: true,
  claimsHatterModuleName: 'Multi Claims Hatter',
  modulesRegistryFactory: '0xfE661c01891172046feE16D3a57c3Cf456729efA',
  APP_URL,
  CONTACT_URL,
  DOCS_URL,

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
    forking: `${DOCS_URL}/using-hats/drafting-exporting-and-deploying-tree-changes#sharing`,
  },
};

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

  // urls
  APP_URL: string;
  CONTACT_URL: string;
  DOCS_URL: string;

  // docs
  docsLinks: {
    responsibilities: string;
    authorities: string;
    eligibility: string;
    toggle: string;
    forking: string;
  };
};

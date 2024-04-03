import { Abi, Hex } from 'viem';

import { CONTACT_URL, DOCS_URL } from './content';
import { HATS_ABI } from './contracts';
import { MINI_CONFIG } from './next-seo.config';

const APP_URL = 'https://app.hatsprotocol.xyz';
const TELEGRAM_KEY = 'VFBDI1RFTCNDT01NIy0xMDAxODUxMjg4MjQy';
const COMMUNITY_HAT_ID = '1.2.1.1';

const CONFIG: Config = {
  ...MINI_CONFIG,
  hatsAddress: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137',
  hatsAbi: HATS_ABI as Abi,
  emojis: '🧢🎩👒',
  protocolVersion: 'v1',
  shortName: 'Hats',
  ipfsGateway: process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://ipfs.io/ipfs/',
  debounce: 350,
  banner: false,
  claimsHatterModuleName: 'Multi Claims Hatter',
  modulesRegistryFactory: '0xfE661c01891172046feE16D3a57c3Cf456729efA',
  agreementV0: {
    hatterAddress: '0xD0929e6Ae5406cBee08604De99F83CF2Ce52d903',
    ipfsHash: 'QmPK856cK97JH74S3VCo8v2UNPdE6TAzHcizzG3mpCJdpp',
    communityHatId: COMMUNITY_HAT_ID,
    telegramLink: `https://telegram.me/collablandbot?start=${TELEGRAM_KEY}`,
    hatsAppLink: `${APP_URL}/trees/10/1?hatId=${COMMUNITY_HAT_ID}`,
  },

  // urls
  APP_URL,
  CLAIMS_URL: 'https://claim.hatsprotocol.xyz',
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

  // tech values
  DEFAULT_PADDING: 2,
  CHAKRA_SPACING: 4,
};

export default CONFIG;

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
  debounce: number;
  banner: boolean;
  claimsHatterModuleName: string;

  // agreement v0
  agreementV0: {
    hatterAddress: string;
    ipfsHash: string;
    communityHatId: string;
    telegramLink: string;
    hatsAppLink: string;
  };

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
  CLAIMS_URL: string;
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

  // tech values
  DEFAULT_PADDING: number;
  CHAKRA_SPACING: number;
};

import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { Hex } from 'viem';

import { CONTACT_URL, DOCS_URL, LANDING_URL } from './content';
import { MINI_CONFIG } from './metadata';

const APP_URL = 'https://app.hatsprotocol.xyz';
const TELEGRAM_KEY = 'VFBDI1RFTCNDT01NIy0xMDAxODUxMjg4MjQy';
const COMMUNITY_HAT_ID = hatIdDecimalToHex(hatIdIpToDecimal('1.2.1.1'));

export const TERMS = {
  hat: 'role',
  hats: 'roles',
  tree: 'tree',
  trees: 'trees',
  // pins
  responsibility: 'responsibility',
  responsibilities: 'responsibilities',
  authority: 'authority',
  authorities: 'authorities',
  // controllers
  eligibility: 'eligibility',
  eligibilities: 'eligibilities',
  toggle: 'toggle',
  toggles: 'toggles',
  wearer: 'wearer',
  wearers: 'wearers',
};

export const CONFIG: Config = {
  ...MINI_CONFIG,
  hatsAddress: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137',
  emojis: '🧢🎩👒',
  protocolVersion: 'v1',
  shortName: 'Hats',
  ipfsGateway: process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://ipfs.io/ipfs/',
  debounce: 350,
  banner: false,
  // modules
  modules: {
    factoryV6: '0xfE661c01891172046feE16D3a57c3Cf456729efA', // previous factory
    factoryV7: '0x0a3f85fa597B6a967271286aA0724811acDF5CD9', // new factory, uses nonce
    claimsHatterV1: '0xB985eA1be961f7c4A4C45504444C02c88c4fdEF9', // mch v1 compatible with factory v6
    claimsHatterV2: '0xBf931B514DECA60Fd386dEC2DCBd42650c7417d9', // mch v2 compatible with factory v7
  },
  // Hats Protocol Community Hat Agreement v0
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
  LANDING_URL,

  // terminology
  TERMS,

  // docs
  docsLinks: {
    responsibilities: `${DOCS_URL}/using-hats/connecting-hats-w-authorities-and-responsibilities/documenting-hat-powers-and-responsibilities`,
    authorities: `${DOCS_URL}/hats-integrations/hat-gated-authorities`,
    eligibility: `${DOCS_URL}/using-hats/setting-accountabilities/eligibility-requirements-for-wearers`,
    toggle: `${DOCS_URL}/using-hats/setting-accountabilities/toggle-activating-and-deactivating-hats`,
    forking: `${DOCS_URL}/using-hats/drafting-exporting-and-deploying-tree-changes#sharing`,
  },

  // tech values
  SHADE_HEADING_LENGTH: 60, // length of the heading in authority/responsibility cards before it is truncated
};

type Config = {
  hatsAddress: Hex;
  emojis: string;
  appName: string;
  protocolVersion: string;
  shortName: string;
  url: string;
  logoUrl: string;
  ipfsGateway: string;
  debounce: number;
  banner: boolean;

  // agreement v0
  agreementV0: {
    hatterAddress: string;
    ipfsHash: string;
    communityHatId: Hex;
    telegramLink: string;
    hatsAppLink: string;
  };

  modules: {
    factoryV6: Hex;
    factoryV7: Hex;
    claimsHatterV1: Hex;
    claimsHatterV2: Hex;
    // claimsHatterV3: string; // with hooks
  };

  TERMS: {
    // general terminology
    hat: string;
    hats: string;
    tree: string;
    trees: string;
    // hat details
    responsibility: string;
    responsibilities: string;
    authority: string;
    authorities: string;
    eligibility: string;
    eligibilities: string;
    toggle: string;
    toggles: string;
    wearer: string;
    wearers: string;
  };

  // urls
  APP_URL: string;
  CLAIMS_URL: string;
  CONTACT_URL: string;
  DOCS_URL: string;
  LANDING_URL: string;

  // docs
  docsLinks: {
    responsibilities: string;
    authorities: string;
    eligibility: string;
    toggle: string;
    forking: string;
  };

  // tech values
  SHADE_HEADING_LENGTH: number;
};

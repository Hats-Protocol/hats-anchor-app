import { Hex } from 'viem';

import defaultHat from './defaultHat';
import {
  EMPTY_FORM_VALUES,
  FORM_FIELDS,
  MODULE_TYPES,
  MUTABILITY,
  STATUS,
  TRIGGER_OPTIONS,
} from './form';
import { featuredTemplates, featuredTrees, learnMore } from './landingContent';
import { FALLBACK_ADDRESS, ZERO_ADDRESS, ZERO_ID } from './misc';
import { initialControls } from './treeControls';

export {
  defaultHat,
  EMPTY_FORM_VALUES,
  FALLBACK_ADDRESS,
  featuredTemplates,
  featuredTrees,
  FORM_FIELDS,
  initialControls,
  learnMore,
  MODULE_TYPES,
  MUTABILITY,
  STATUS,
  TRIGGER_OPTIONS,
  ZERO_ADDRESS,
  ZERO_ID,
};

const CONFIG: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  hatsAddress: Hex;
} = {
  hatsAddress: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137',
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
      'https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/toggle-requirements-for-wearers',
  },
};

export default CONFIG;

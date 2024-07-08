import {
  Charmverse,
  Discord,
  Etherscan,
  Github,
  Guild,
  HatIcon,
  Safe,
  Snapshot,
  Telegram,
} from 'icons';
// import { ReactNode } from 'react';
import { AuthorityType } from 'types';

export const AUTHORITY_TYPES: { [key in AuthorityType]: string } = {
  protocol: 'protocol',
  modules: 'modules',
  account: 'account',
  hsg: 'hsg',
  onchain: 'onchain',
  gate: 'gate',
  manual: 'manual',
};

export type AuthorityInfo = {
  label: string;
  info: string;
  color: string;
  name?: string;
  icon?: any; // ReactNode; // name of an icon to be used for fallback
  imageUri?: string; // used for fallback if icon is not available
  enforcementIcon: string; // actually an SVG imported currently, could migrate to Icon
};

// ! don't try to import `ipfsUrl` here as it will cause a circular dependency

export const AUTHORITY_ENFORCEMENT: {
  [key in AuthorityType]: AuthorityInfo;
} = {
  protocol: {
    label: 'Onchain Authority',
    info: 'Connected onchain via Hats Protocol',
    color: 'green.300',
    icon: HatIcon,
    enforcementIcon: '/icons/onchain.svg',
  },
  modules: {
    label: 'Onchain Authority',
    info: 'Connected onchain via an eligibility or toggle module',
    color: 'green.300',
    name: 'Module',
    icon: HatIcon,
    enforcementIcon: '/icons/onchain.svg',
  },
  account: {
    label: 'Onchain Authority',
    info: 'Connected onchain via HatsAccount',
    color: 'green.300',
    name: 'Hats Account',
    icon: HatIcon,
    enforcementIcon: '/icons/onchain.svg',
  },
  hsg: {
    label: 'Onchain Authority',
    info: 'Connected onchain via HatsSignerGate',
    color: 'green.300',
    name: 'HSG',
    icon: Safe,
    enforcementIcon: '/icons/onchain.svg',
  },
  onchain: {
    label: 'Onchain Authority',
    info: '',
    color: 'green.300',
    icon: HatIcon,
    enforcementIcon: '/icons/onchain.svg',
  },
  gate: {
    label: 'Token-gated Authority',
    info: 'Pulled directly from the gate API',
    color: 'green.300',
    enforcementIcon: '/icons/token-gated.svg',
  },
  manual: {
    label: 'Off-chain Authority',
    info: 'Appended off-chain for clarity',
    color: 'purple.300',
    // imageUri: '',
    enforcementIcon: '/icons/off-chain.svg',
  },
};

export type AuthorityPlatform = {
  label: string;
  icon?: any; // ReactNode;
};

// map guild's platforms to AUTHORITY_PLATFORMS
export const GUILD_PLATFORMS: {
  [key: number]: string;
} = {
  1: 'discord',
  2: 'telegram',
  3: 'github',
  4: 'docs',
};

export const AUTHORITY_PLATFORMS: {
  [key: string]: AuthorityPlatform;
} = {
  charmverse: { label: 'Charmverse', icon: Charmverse },
  discord: { label: 'Discord', icon: Discord },
  docs: { label: 'Google Docs', icon: Guild },
  etherscan: { label: 'Etherscan', icon: Etherscan },
  github: { label: 'GitHub', icon: Github },
  guild: { label: 'Guild', icon: Guild },
  safe: { label: 'Safe', icon: Safe },
  snapshot: { label: 'Snapshot', icon: Snapshot },
  telegram: { label: 'Telegram', icon: Telegram },
  twitter: { label: 'Twitter', icon: Telegram },
};

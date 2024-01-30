import { AuthorityType } from 'hats-types';

export const AUTHORITY_TYPES: { [key in AuthorityType]: string } = {
  protocol: 'protocol',
  modules: 'modules',
  wallet: 'wallet',
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
  imageUri?: string;
};

export const AUTHORITY_ENFORCEMENT: {
  [key in AuthorityType]: AuthorityInfo;
} = {
  protocol: {
    label: 'Hats Protocol Authority',
    info: 'Connected onchain via Hats Protocol',
    color: 'green.300',
    imageUri: '/icon.jpeg',
  },
  modules: {
    label: 'Hats Modules Authority',
    info: 'Connected onchain via an eligibility or toggle module',
    color: 'green.300',
    name: 'Module',
  },
  wallet: {
    label: 'HatsWallet Authority',
    info: '',
    color: 'green.300',
  },
  hsg: {
    label: 'HatsSignerGate Authority',
    info: 'Connected onchain via HatsSignerGate',
    color: 'green.300',
    name: 'HSG',
    imageUri: 'ipfs://QmTPSzPCmi8w7fM7WhkWePH4mBV1WNFyT3G3goBg45UnGB',
  },
  onchain: {
    label: 'Connected Onchain Authority',
    info: '',
    color: 'green.300',
  },
  gate: {
    label: 'Connected Token-gated Authority',
    info: 'Pulled directly from the gate API',
    color: 'green.300',
  },
  manual: {
    label: 'Social Authority',
    info: 'Appended off-chain for clarity',
    color: 'purple.300',
  },
};

export type AuthorityPlatform = {
  label: string;
  icon: string;
};

export const AUTHORITY_PLATFORMS: {
  [key: number | string]: AuthorityPlatform;
} = {
  1: {
    label: 'Discord',
    icon: 'ipfs://QmPqL5WeuKZod1EnS2jeNhocVe5a9sXLTzbvpo47ZRydLd',
  },
  2: {
    label: 'Telegram',
    icon: 'ipfs://QmX4qMuCnkJguSnf4L5wdi3dcfrqdNPctSQH6BtJZFT1yr',
  },
  3: {
    label: 'GitHub',
    icon: 'ipfs://QmYLQiMBfDm6Mtbz97JnNDAZVLietA8z9m5ThRULxNLxgq',
  },
  4: {
    label: 'Google Docs',
    icon: 'ipfs://QmXgcdaCnfkfTj2cJHn7Sr9Xxa4eb1grjADMjb8FzAqqSt',
  },
  snapshot: {
    label: 'Snapshot',
    icon: 'ipfs://QmQwKSu2StPNqSFZC5u17jYtxwfP9fmdrVJVxLxi7mTS9S',
  },
};

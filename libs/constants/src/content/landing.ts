import {
  Allo,
  Aragon,
  CheckSquare,
  CodeIcon,
  Discord,
  Farcaster,
  HatIcon,
  PeopleIcon,
  Sablier,
  Safe,
  Snapshot,
  Splits,
  Superfluid,
  Tally,
  Telegram,
} from 'icons';

export const DOCS_URL = 'https://docs.hatsprotocol.xyz';
export const CONTACT_URL = 'https://hatsprotocol.deform.cc/getintouch/';

export const LEARN_MORE = [
  {
    url: `${DOCS_URL}/using-hats/essentials-for-hat-wearers`,
    name: 'For Hat Wearers',
    description: 'So your organization gave you a hat. Now what?',
    icon: HatIcon,
  },
  {
    url: `${DOCS_URL}/getting-started-with-hats`,
    name: 'For Governors',
    description:
      'Everything you need to know to start structuring your organization with hats',
    icon: CheckSquare,
  },
  {
    url: `${DOCS_URL}/for-developers/hats-protocol-overview`,
    name: 'For Developers',
    description:
      'Protocol and SDK docs for building on top of the open-source protocol',
    icon: CodeIcon,
  },
  {
    url: CONTACT_URL,
    name: 'Get in touch!',
    description:
      'Stuck on tree design, deployment, or custom development? We can help.',
    icon: PeopleIcon,
  },
];

export type TemplateData = {
  chainId: number;
  id: number;
  name: string;
  description: string;
  image: string;
  avatar?: string;
  // optional values will override fetched values for the tree
  hats?: number;
  wearers?: number;
};

// ! CURRENTLY UNUSED ON LANDING PAGE
export const FEATURED_TEMPLATES = ({
  ipfsUrl,
}: {
  ipfsUrl: (hash: string | undefined) => string | null;
}) => [
  {
    chainId: 5,
    id: 54,
    name: 'Elected Roles',
    // description:
    //   'Delegate roles and authorities automatically based on election results',
    image: `${ipfsUrl(
      'bafybeibsxnaoo7bsuyp4dm3ce752lf7q2ruvnor4zuqfaerw4kt7dki6h4',
    )}`,
  },
  {
    chainId: 5,
    id: 55,
    name: 'DAO-controlled Multisig & Signers',
    // description:
    //   'Give and revoke multisig signing authority based on having a hat',
    image: `${ipfsUrl(
      'bafybeief2r46xuo4whpingntuntm4yoafedrfr7ky5cu4n2ydurgbnnbne',
    )}`,
  },
  {
    chainId: 5,
    id: 56,
    name: 'Permissionless Contribution Levels',
    // description:
    //   'Members can level up and claim new authorities as they increase their reputation in your org',
    image: `${ipfsUrl(
      'bafybeifne2l5kflemqffegryh7ameo3mw72jw2j4erky2xmyzmw3uspsei',
    )}`,
  },
];

export const FEATURED_TREES = ({
  ipfsUrl,
}: {
  ipfsUrl: (hash: string | undefined) => string | null;
}) => [
  {
    chainId: 1,
    id: 22,
    name: 'RareDAO',
    // description: '',
    image: `${ipfsUrl('QmT1t9TZBGjZKuoNwS1hfB8C7RsdJ9PtAGHDcbT7ynKDGW')}`,
    avatar: `${ipfsUrl('QmZDcD9Zt1CT9HUgWND39ksPtgkGiL8ZgMDgmHkSQJkEq8')}`,
  },
  {
    chainId: 10,
    id: 24,
    name: 'PublicHAUS',
    // description: '',
    image: `${ipfsUrl('QmPf5fefBSuJY8CwbvvnKPKcFx43rhsxA3r4ejheVdBFxa')}`,
    avatar: `${ipfsUrl(
      'bafkreihsni2egpyl4c7hxvzg32ciwvaevvtu3smx27jai76qq5ysuikbi4',
    )}`,
  },
  {
    chainId: 42161,
    id: 6,
    name: 'TreasureDAO',
    // description: '',
    image: `${ipfsUrl('QmYjAkvXxigyr5bNdCmfFd2KprJccFUdwD9BD4R87t6Krm')}`,
    avatar: `${ipfsUrl('QmZZ6TYAMSodS18mjy9TNixKPjYad4dwcfVwCv6T1dHn8L')}`,
  },
  {
    chainId: 100,
    id: 92,
    name: 'RaidGuild',
    // description: '',
    image: `${ipfsUrl('QmdnMfEd6T16Q1PwabzB8xr3rfbtc2aGGQjMJUNi25NPVD')}`,
    avatar: `${ipfsUrl('QmYxu6196HQsgTLoHmj2od6s2YQko6BSdQu2tYdvt1HiP4')}`,
  },
  {
    chainId: 42161,
    id: 8,
    name: 'Premia',
    // description: '',
    image: `${ipfsUrl('QmYimWiE5zTH1JJfoAMZk2AAozeEFCnLNZ39WAqHHHYVPe')}`,
    avatar: `${ipfsUrl('QmZ888k7Lr67cYxFaHMz9oQfVBkjGcovsfJAXu8PksttE2')}`,
  },
  {
    chainId: 10,
    id: 1,
    name: 'Hats protoDAO',
    // description: '',
    image: `${ipfsUrl('QmdDnRisrvGtYSBfgeDaAocTsVb6fUickZsa7ebc8A25jq')}`,
    avatar: `${ipfsUrl('Qmagom5JCG4haXZsFQRMVt6ZBXzqjsdo7p8qtayfBwwtBe')}`,
    hats: 11,
    wearers: 309,
  },
];

export type IntegrationCard = {
  label: string;
  icons: string[];
};

export const INTEGRATION_CARDS: IntegrationCard[] = [
  {
    label: 'Award Hats via DAO vote or onchain elections',
    icons: [Snapshot, Aragon, Tally], // TODO replace Aragon with JokeRace
  },
  {
    label: 'Automatically pay active contributors onchain',
    icons: [Splits, Superfluid, Sablier],
  },
  {
    label: 'Control onchain assets and signer rights',
    icons: [Safe, HatIcon, Allo],
  },
  {
    label: 'Token-gate access and roles in your community',
    icons: [Telegram, Farcaster, Discord],
  },
];

import {
  Allo,
  CheckSquare,
  CodeIcon,
  Discord,
  Farcaster,
  HatIcon,
  JokeRaceShort,
  People,
  Sablier,
  Safe,
  Snapshot,
  Splits,
  Superfluid,
  Tally,
  Telegram,
} from 'icons';

export const LANDING_URL = 'https://www.hatsprotocol.xyz';
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
    name: 'For Operators',
    description: 'Everything you need to know to start structuring your organization with hats',
    icon: CheckSquare,
  },
  {
    url: `${DOCS_URL}/for-developers/hats-protocol-overview`,
    name: 'For Developers',
    description: 'Protocol and SDK docs for building on top of the open-source protocol',
    icon: CodeIcon,
  },
  {
    url: CONTACT_URL,
    name: 'Request Support',
    description:
      "We've available to help with org design, setting up your Hats, and custom development. Contact us here.",
    icon: People,
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
export const FEATURED_TEMPLATES = ({ ipfsUrl }: { ipfsUrl: (hash: string | undefined) => string | null }) => {
  return [
    {
      chainId: 5,
      id: 54,
      name: 'Elected Roles',
      // description:
      //   'Delegate roles and authorities automatically based on election results',
      image: `${ipfsUrl('bafybeibsxnaoo7bsuyp4dm3ce752lf7q2ruvnor4zuqfaerw4kt7dki6h4')}`,
    },
    {
      chainId: 5,
      id: 55,
      name: 'DAO-controlled Multisig & Signers',
      // description:
      //   'Give and revoke multisig signing authority based on having a hat',
      image: `${ipfsUrl('bafybeief2r46xuo4whpingntuntm4yoafedrfr7ky5cu4n2ydurgbnnbne')}`,
    },
    {
      chainId: 5,
      id: 56,
      name: 'Permissionless Contribution Levels',
      // description:
      //   'Members can level up and claim new authorities as they increase their reputation in your org',
      image: `${ipfsUrl('bafybeifne2l5kflemqffegryh7ameo3mw72jw2j4erky2xmyzmw3uspsei')}`,
    },
  ];
};

export const FEATURED_TREES = ({ ipfsUrl }: { ipfsUrl: (hash: string | undefined) => string | null }) => {
  return [
    {
      chainId: 8453,
      id: 13,
      name: 'Purple',
      image: `${ipfsUrl('QmTmKpnXL1R6H3upJbG3KHzRLi2oyJ8rnhL8fEechCJ2NV')}`,
      avatar: `${ipfsUrl('QmXrBfva1iT1HiRRd8VUCifHDYwUTueeBeVefRdTg1DEXf')}`,
    },
    {
      chainId: 1,
      id: 22,
      name: 'RareDAO',
      image: `${ipfsUrl('QmT1t9TZBGjZKuoNwS1hfB8C7RsdJ9PtAGHDcbT7ynKDGW')}`,
      avatar: `${ipfsUrl('QmZDcD9Zt1CT9HUgWND39ksPtgkGiL8ZgMDgmHkSQJkEq8')}`,
    },
    // {
    //   chainId: 10,
    //   id: 24,
    //   name: 'PublicHAUS',
    //   image: `${ipfsUrl('QmPf5fefBSuJY8CwbvvnKPKcFx43rhsxA3r4ejheVdBFxa')}`,
    //   avatar: `${ipfsUrl(
    //     'bafkreihsni2egpyl4c7hxvzg32ciwvaevvtu3smx27jai76qq5ysuikbi4',
    //   )}`,
    // },
    {
      chainId: 42161,
      id: 6,
      name: 'TreasureDAO',
      image: `${ipfsUrl('QmYjAkvXxigyr5bNdCmfFd2KprJccFUdwD9BD4R87t6Krm')}`,
      avatar: `${ipfsUrl('QmZZ6TYAMSodS18mjy9TNixKPjYad4dwcfVwCv6T1dHn8L')}`,
    },
    {
      chainId: 100,
      id: 92,
      name: 'RaidGuild',
      image: `${ipfsUrl('QmdnMfEd6T16Q1PwabzB8xr3rfbtc2aGGQjMJUNi25NPVD')}`,
      avatar: `${ipfsUrl('QmYxu6196HQsgTLoHmj2od6s2YQko6BSdQu2tYdvt1HiP4')}`,
    },
    {
      chainId: 42161,
      id: 15,
      name: 'QuestBook',
      image: `${ipfsUrl('QmZJemXqmivFRmCDchHC7z4SWmMjPGf6ARUUZffojpmXhz')}`,
      avatar: `${ipfsUrl('QmbNoW3BrUbvb3iMZbTf1usyVDeD9Fa4SJKYujzS6UWrTo')}`,
    },
    {
      chainId: 10,
      id: 1,
      name: 'Hats protoDAO',
      image: `${ipfsUrl('QmdDnRisrvGtYSBfgeDaAocTsVb6fUickZsa7ebc8A25jq')}`,
      avatar: `${ipfsUrl('Qmagom5JCG4haXZsFQRMVt6ZBXzqjsdo7p8qtayfBwwtBe')}`,
      hats: 11,
      wearers: 309,
    },
    // {
    //   chainId: 42161,
    //   id: 8,
    //   name: 'Premia',
    //   image: `${ipfsUrl('QmYimWiE5zTH1JJfoAMZk2AAozeEFCnLNZ39WAqHHHYVPe')}`,
    //   avatar: `${ipfsUrl('QmZ888k7Lr67cYxFaHMz9oQfVBkjGcovsfJAXu8PksttE2')}`,
    // },
  ];
};

export type IntegrationCard = {
  label: string;
  icons: any[];
  link: string;
};

export const INTEGRATION_CARDS: IntegrationCard[] = [
  {
    label: 'Control onchain assets and Safe signer rights',
    icons: [Safe, HatIcon, Allo],
    link: `${LANDING_URL}/wearer/multisigs`,
  },
  {
    label: 'Automate contributor access & permissions',
    icons: [Telegram, Farcaster, Discord],
    link: `${LANDING_URL}/wearer/access`,
  },
  {
    label: 'Seamless powers for election winners',
    icons: [Snapshot, JokeRaceShort, Tally],
    link: `${LANDING_URL}/wearer/elections`,
  },
  {
    label: 'Collect membership fees or stream compensation',
    icons: [Splits, Superfluid, Sablier], // Unlock logo
    link: `${LANDING_URL}`,
  },
];

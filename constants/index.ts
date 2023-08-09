export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const FALLBACK_ADDRESS = '0x0000000000000000000000000000000000004a75';

export const MODULE_TYPES: { [key: string]: string } = {
  eligibility: 'ELIGIBILITY',
  toggle: 'TOGGLE',
};

export const STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const MUTABILITY = {
  MUTABLE: 'Mutable',
  IMMUTABLE: 'Immutable',
};

export const TRIGGER_OPTIONS = {
  MANUALLY: 'Manually',
  AUTOMATICALLY: 'Automatically',
};

const CONFIG: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  hatsAddress: `0x${string}`;
} = {
  hatsAddress: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137',
  emojis: '🧢🎩👒',
  appName: 'Hats Protocol',
  protocolVersion: '1.0',
  shortName: 'Hats',
  url: 'https://app.hatsprotocol.xyz',
  logoUrl:
    'https://indigo-selective-coral-505.mypinata.cloud/ipfs/QmbQy4vsu4aAHuQwpHoHUsEURtiYKEbhv7ouumBXiierp9?filename=hats%20hat.jpg',
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
};

export const learnMore = [
  {
    url: 'https://docs.hatsprotocol.xyz/',
    name: 'For Hat Wearers',
    description: 'So your DAO gave you a Hat, now what?',
    icon: 'hat',
  },
  {
    url: 'https://docs.hatsprotocol.xyz/getting-started-with-hats',
    name: 'For Governors',
    description:
      'Everything you need to know to get started structuring your organization with hats',
    icon: 'check-square',
  },
  {
    url: 'https://docs.hatsprotocol.xyz/for-developers/hats-protocol-overview',
    name: 'For Chad Hats Dev',
    description:
      'Protocol and SDK documentation for building on top of the open-source protocol',
    icon: 'code',
  },
  {
    url: 'mailto:support@hatsprotocol.xyz',
    name: 'Get in touch!',
    description:
      'Stuck on tree design, deployment, or custom contract development? We’re here to help.',
    icon: 'people',
  },
];

export const featuredTemplates = [
  {
    chainId: 5,
    id: 54,
    name: 'Elected Roles',
    description:
      'Delegate roles and authorities automatically based on election results',
    image: `https://indigo-selective-coral-505.mypinata.cloud/ipfs/QmZMzmAKjeEWSbsQsRTKAUHD6u8BbMEdfLSXPviL6Br8na?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt`,
  },
  {
    chainId: 5,
    id: 55,
    name: 'DAO-controlled Multisig & Signers',
    description:
      'Give and revoke multisig signing authority based on Hat ownerships',
    image: `https://indigo-selective-coral-505.mypinata.cloud/ipfs/bafybeie7nv4u6pd3ryv7goritnmkhvzwdxj2a2en7qaf5bbsntzec5jnea?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt`,
  },
  {
    chainId: 5,
    id: 56,
    name: 'Permissionless Contribution Levels',
    description:
      'Members can level up and claim new authorities as they increase their reputation in your org',
    image: `https://indigo-selective-coral-505.mypinata.cloud/ipfs/QmWaiWKkRQtZQ5MuNHgYgwk48ubicyf7Ph8f6ZRUuUKmik?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt`,
  },
];

export const featuredTrees = [
  {
    chainId: 10,
    id: 2,
    name: 'Cabin DAO',
    description: 'A DAO for the Cabin community',
    image: `https://indigo-selective-coral-505.mypinata.cloud/ipfs/QmZMzmAKjeEWSbsQsRTKAUHD6u8BbMEdfLSXPviL6Br8na?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt`,
    avatar:
      'https://indigo-selective-coral-505.mypinata.cloud/ipfs/bafybeibwy623bvifnke6zzisrdw4hpqjy2juhd7lgnrjk6liqpewls2x7q?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt',
  },
  {
    chainId: 100,
    id: 72,
    name: 'The DIA',
    description: 'A DAO for decentralized curation of intel',
    image: `https://indigo-selective-coral-505.mypinata.cloud/ipfs/bafybeie7nv4u6pd3ryv7goritnmkhvzwdxj2a2en7qaf5bbsntzec5jnea?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt`,
    avatar:
      'https://indigo-selective-coral-505.mypinata.cloud/ipfs/bafkreicy6iz67k4nutvxs7gtviuxt255k6w2ofxouxi54wrfm5thecg6x4?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt',
  },
  {
    chainId: 10,
    id: 3,
    name: 'DemoDAO',
    description: 'An exquisite DAO for demo purposes',
    image: `https://indigo-selective-coral-505.mypinata.cloud/ipfs/QmWaiWKkRQtZQ5MuNHgYgwk48ubicyf7Ph8f6ZRUuUKmik?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt`,
    avatar:
      'https://indigo-selective-coral-505.mypinata.cloud/ipfs/bafybeif7ahzj4tpjglisecg5fqi4a7p5wp7ke2xbr6wg5pefa5l3zt5ulq/?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt',
  },
];

export default CONFIG;

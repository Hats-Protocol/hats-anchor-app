import { CheckSquare, CodeIcon, HatIcon, PeopleIcon } from 'icons';

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
};

export const FEATURED_TEMPLATES = ({
  ipfsUrl,
}: {
  ipfsUrl: (hash: string | undefined) => string | null;
}) => [
  {
    chainId: 5,
    id: 54,
    name: 'Elected Roles',
    description:
      'Delegate roles and authorities automatically based on election results',
    image: `${ipfsUrl(
      'bafybeibsxnaoo7bsuyp4dm3ce752lf7q2ruvnor4zuqfaerw4kt7dki6h4',
    )}`,
  },
  {
    chainId: 5,
    id: 55,
    name: 'DAO-controlled Multisig & Signers',
    description:
      'Give and revoke multisig signing authority based on having a hat',
    image: `${ipfsUrl(
      'bafybeief2r46xuo4whpingntuntm4yoafedrfr7ky5cu4n2ydurgbnnbne',
    )}`,
  },
  {
    chainId: 5,
    id: 56,
    name: 'Permissionless Contribution Levels',
    description:
      'Members can level up and claim new authorities as they increase their reputation in your org',
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
    chainId: 10,
    id: 2,
    name: 'Cabin DAO',
    description: 'A DAO for the Cabin community',
    image: `${ipfsUrl('QmZMzmAKjeEWSbsQsRTKAUHD6u8BbMEdfLSXPviL6Br8na')}`,
    avatar: `${ipfsUrl(
      'bafybeibwy623bvifnke6zzisrdw4hpqjy2juhd7lgnrjk6liqpewls2x7q',
    )}`,
  },
  {
    chainId: 100,
    id: 72,
    name: 'The DIA',
    description: 'A DAO for decentralized curation of intel',
    image: `${ipfsUrl(
      'bafybeie7nv4u6pd3ryv7goritnmkhvzwdxj2a2en7qaf5bbsntzec5jnea',
    )}`,
    avatar: `${ipfsUrl(
      'bafkreicy6iz67k4nutvxs7gtviuxt255k6w2ofxouxi54wrfm5thecg6x4',
    )}`,
  },
  {
    chainId: 5,
    id: 6,
    name: 'DemoDAO',
    description: 'An exquisite DAO for demo purposes',
    image: `${ipfsUrl('QmWaiWKkRQtZQ5MuNHgYgwk48ubicyf7Ph8f6ZRUuUKmik')}`,
    avatar: `${ipfsUrl(
      'bafybeif7ahzj4tpjglisecg5fqi4a7p5wp7ke2xbr6wg5pefa5l3zt5ulq',
    )}`,
  },
];

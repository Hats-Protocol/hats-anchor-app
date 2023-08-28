import { Hex } from 'viem';

import { FALLBACK_ADDRESS } from './misc';

const defaultHat = {
  status: true,
  // "createdAt": "1690859700",
  // details: 'ipfs://bafkreibiy5zoc3ijmbpz46pbkjwblgckkx7nenac2jboqi2575jikroxj4',
  maxSupply: '1',
  eligibility: FALLBACK_ADDRESS,
  toggle: FALLBACK_ADDRESS,
  mutable: true,
  levelAtLocalTree: 0,
  currentSupply: '0',
  events: [],
  tree: {
    id: '0x00000001' as Hex,
  },
  wearers: [],
  admin: undefined,
  imageUrl: '',
  details: '',
  detailsObject: undefined,
  isLinked: false,
};

export default defaultHat;

import { Hex } from 'viem';

import { FALLBACK_ADDRESS } from './misc';

const DEFAULT_HAT = {
  status: true,
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
  // details
  name: '',
  description: '',
  guilds: [],
  spaces: [],
  responsibilities: [],
  authorities: [],
  isEligibilityManual: false,
  isToggleManual: false,
  revocationsCriteria: [],
  deactivationsCriteria: [],
};

export default DEFAULT_HAT;

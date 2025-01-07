export const MULTICALL3_ADDRESS =
  '0xcA11bde05977b3631167028862bE2a173976CA11' as const;

export const HATS_ADDRESS =
  '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137' as const;

export const HSG_V2_ADDRESS =
  '0x148057884AC910Bdd93693F230C5c35a8c47CA3b' as const;

export const ZODIAC_MODULE_PROXY_FACTORY_ADDRESS =
  '0x000000000000aDdB49795b0f9bA5BC298cDda236' as const;

export const HATS_MODULES_FACTORY_ADDRESS =
  '0x0a3f85fa597B6a967271286aA0724811acDF5CD9' as const;

export const ALLOWLIST_ELIGIBILITY_ADDRESS =
  '0x80336fb7b6B653686eBe71d2c3ee685b70108B8f' as const;

export const AGREEMENT_ELIGIBILITY_ADDRESS =
  '0x4F10B9e99ce11f081652646f4b192ed1b812D5Bb' as const;

export const MULTI_CLAIMS_HATTER_V1_ADDRESS =
  '0xB985eA1be961f7c4A4C45504444C02c88c4fdEF9' as const;

export const ELIGIBILITY_CHAIN_ADDRESS =
  '0x8AdED513a191e3FeE91Bb192Aba20FcC9c16aF2e' as const;

export const ERC20_ELIGIBILITY_ADDRESS =
  '0xba5b218e6685d0607139c06f81442681a32a0ec3' as const;

export const ELIGIBILITY_CHAIN_ABI = [
  {
    inputs: [{ internalType: 'string', name: '_version', type: 'string' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    inputs: [],
    name: 'CONJUNCTION_CLAUSE_LENGTHS',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'HATS',
    outputs: [{ internalType: 'contract IHats', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'IMPLEMENTATION',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MODULES',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'NUM_CONJUNCTION_CLAUSES',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_wearer', type: 'address' },
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
    ],
    name: 'getWearerStatus',
    outputs: [
      { internalType: 'bool', name: 'eligible', type: 'bool' },
      { internalType: 'bool', name: 'standing', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'hatId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: '_initData', type: 'bytes' }],
    name: 'setUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version_',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const MULTI_CLAIMS_HATTER_V1_ABI = [
  {
    inputs: [{ internalType: 'string', name: '_version', type: 'string' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'MultiClaimsHatter_ArrayLengthMismatch', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'hatId', type: 'uint256' }],
    name: 'MultiClaimsHatter_HatNotClaimable',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'hatId', type: 'uint256' }],
    name: 'MultiClaimsHatter_HatNotClaimableFor',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'hatId', type: 'uint256' },
    ],
    name: 'MultiClaimsHatter_NotAdminOfHat',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'hatId', type: 'uint256' },
    ],
    name: 'MultiClaimsHatter_NotExplicitlyEligible',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'hatId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'enum MultiClaimsHatter.ClaimType',
        name: 'claimType',
        type: 'uint8',
      },
    ],
    name: 'HatClaimabilitySet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'hatIds',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'enum MultiClaimsHatter.ClaimType[]',
        name: 'claimTypes',
        type: 'uint8[]',
      },
    ],
    name: 'HatsClaimabilitySet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    inputs: [],
    name: 'HATS',
    outputs: [{ internalType: 'contract IHats', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'IMPLEMENTATION',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_account', type: 'address' },
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
    ],
    name: 'accountCanClaim',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_account', type: 'address' },
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
    ],
    name: 'canClaimForAccount',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'claimHat',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'address', name: '_account', type: 'address' },
    ],
    name: 'claimHatFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256[]', name: '_hatIds', type: 'uint256[]' }],
    name: 'claimHats',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256[]', name: '_hatIds', type: 'uint256[]' },
      { internalType: 'address[]', name: '_accounts', type: 'address[]' },
    ],
    name: 'claimHatsFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'hatExists',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'hatId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'hatId', type: 'uint256' }],
    name: 'hatToClaimType',
    outputs: [
      {
        internalType: 'enum MultiClaimsHatter.ClaimType',
        name: 'claimType',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'isClaimableBy',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'isClaimableFor',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      {
        internalType: 'enum MultiClaimsHatter.ClaimType',
        name: '_claimType',
        type: 'uint8',
      },
    ],
    name: 'setHatClaimability',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract HatsModuleFactory',
        name: '_factory',
        type: 'address',
      },
      { internalType: 'address', name: '_implementation', type: 'address' },
      { internalType: 'uint256', name: '_moduleHatId', type: 'uint256' },
      { internalType: 'bytes', name: '_otherImmutableArgs', type: 'bytes' },
      { internalType: 'bytes', name: '_initData', type: 'bytes' },
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      {
        internalType: 'enum MultiClaimsHatter.ClaimType',
        name: '_claimType',
        type: 'uint8',
      },
    ],
    name: 'setHatClaimabilityAndCreateModule',
    outputs: [{ internalType: 'address', name: '_instance', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256[]', name: '_hatIds', type: 'uint256[]' },
      {
        internalType: 'enum MultiClaimsHatter.ClaimType[]',
        name: '_claimTypes',
        type: 'uint8[]',
      },
    ],
    name: 'setHatsClaimability',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract HatsModuleFactory',
        name: '_factory',
        type: 'address',
      },
      {
        internalType: 'address[]',
        name: '_implementations',
        type: 'address[]',
      },
      { internalType: 'uint256[]', name: '_moduleHatIds', type: 'uint256[]' },
      {
        internalType: 'bytes[]',
        name: '_otherImmutableArgsArray',
        type: 'bytes[]',
      },
      { internalType: 'bytes[]', name: '_initDataArray', type: 'bytes[]' },
      { internalType: 'uint256[]', name: '_hatIds', type: 'uint256[]' },
      {
        internalType: 'enum MultiClaimsHatter.ClaimType[]',
        name: '_claimTypes',
        type: 'uint8[]',
      },
    ],
    name: 'setHatsClaimabilityAndCreateModules',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: '_initData', type: 'bytes' }],
    name: 'setUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version_',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'wearsAdmin',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const AGREEMENT_ELIGIBILITY_ABI = [
  {
    inputs: [{ internalType: 'string', name: '_version', type: 'string' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'AgreementEligibility_HatNotMutable', type: 'error' },
  { inputs: [], name: 'AgreementEligibility_NotArbitrator', type: 'error' },
  { inputs: [], name: 'AgreementEligibility_NotOwner', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'agreement',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'grace',
        type: 'uint256',
      },
    ],
    name: 'AgreementEligibility_AgreementSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'signer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'agreement',
        type: 'string',
      },
    ],
    name: 'AgreementEligibility_AgreementSigned',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newArbitratorHat',
        type: 'uint256',
      },
    ],
    name: 'AgreementEligibility_ArbitratorHatSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'wearer',
        type: 'address',
      },
    ],
    name: 'AgreementEligibility_Forgiven',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'wearers',
        type: 'address[]',
      },
    ],
    name: 'AgreementEligibility_Forgiven',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'claimer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'hatId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'agreement',
        type: 'string',
      },
    ],
    name: 'AgreementEligibility_HatClaimedWithAgreement',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newOwnerHat',
        type: 'uint256',
      },
    ],
    name: 'AgreementEligibility_OwnerHatSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'wearer',
        type: 'address',
      },
    ],
    name: 'AgreementEligibility_Revoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'wearers',
        type: 'address[]',
      },
    ],
    name: 'AgreementEligibility_Revoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    inputs: [],
    name: 'HATS',
    outputs: [{ internalType: 'contract IHats', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'IMPLEMENTATION',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'arbitratorHat',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'claimer', type: 'address' }],
    name: 'claimerAgreements',
    outputs: [
      { internalType: 'uint256', name: 'agreementId', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentAgreement',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentAgreementId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_wearer', type: 'address' }],
    name: 'forgive',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: '_wearers', type: 'address[]' },
    ],
    name: 'forgive',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_wearer', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'getWearerStatus',
    outputs: [
      { internalType: 'bool', name: 'eligible', type: 'bool' },
      { internalType: 'bool', name: 'standing', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'graceEndsAt',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'hatId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ownerHat',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: '_wearers', type: 'address[]' },
    ],
    name: 'revoke',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_wearer', type: 'address' }],
    name: 'revoke',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: '_agreement', type: 'string' },
      { internalType: 'uint256', name: '_grace', type: 'uint256' },
    ],
    name: 'setAgreement',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_newArbitratorHat', type: 'uint256' },
    ],
    name: 'setArbitratorHat',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_newOwnerHat', type: 'uint256' },
    ],
    name: 'setOwnerHat',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: '_initData', type: 'bytes' }],
    name: 'setUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'signAgreement',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_claimsHatter', type: 'address' },
    ],
    name: 'signAgreementAndClaimHat',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version_',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_wearer', type: 'address' }],
    name: 'wearerStanding',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const ALLOWLIST_ELIGIBILITY_ABI = [
  {
    inputs: [{ internalType: 'string', name: '_version', type: 'string' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'AllowlistEligibility_ArrayLengthMismatch',
    type: 'error',
  },
  { inputs: [], name: 'AllowlistEligibility_HatNotMutable', type: 'error' },
  { inputs: [], name: 'AllowlistEligibility_NotArbitrator', type: 'error' },
  { inputs: [], name: 'AllowlistEligibility_NotOwner', type: 'error' },
  { inputs: [], name: 'AllowlistEligibility_NotWearer', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'AccountAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'AccountRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      { indexed: false, internalType: 'bool', name: 'standing', type: 'bool' },
    ],
    name: 'AccountStandingChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'accounts',
        type: 'address[]',
      },
    ],
    name: 'AccountsAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'accounts',
        type: 'address[]',
      },
    ],
    name: 'AccountsRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'accounts',
        type: 'address[]',
      },
      {
        indexed: false,
        internalType: 'bool[]',
        name: 'standing',
        type: 'bool[]',
      },
    ],
    name: 'AccountsStandingChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newArbitratorHat',
        type: 'uint256',
      },
    ],
    name: 'ArbitratorHatSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newOwnerHat',
        type: 'uint256',
      },
    ],
    name: 'OwnerHatSet',
    type: 'event',
  },
  {
    inputs: [],
    name: 'HATS',
    outputs: [{ internalType: 'contract IHats', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'IMPLEMENTATION',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
    name: 'addAccount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: '_accounts', type: 'address[]' },
    ],
    name: 'addAccounts',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'allowlist',
    outputs: [
      { internalType: 'bool', name: 'eligible', type: 'bool' },
      { internalType: 'bool', name: 'badStanding', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'arbitratorHat',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_wearer', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'getWearerStatus',
    outputs: [
      { internalType: 'bool', name: '_eligible', type: 'bool' },
      { internalType: 'bool', name: '_standing', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'hatId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ownerHat',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
    name: 'removeAccount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
    name: 'removeAccountAndBurnHat',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: '_accounts', type: 'address[]' },
    ],
    name: 'removeAccounts',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_newArbitratorHat', type: 'uint256' },
    ],
    name: 'setArbitratorHat',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
    name: 'setBadStandingAndBurnHat',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_newOwnerHat', type: 'uint256' },
    ],
    name: 'setOwnerHat',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_account', type: 'address' },
      { internalType: 'bool', name: '_standing', type: 'bool' },
    ],
    name: 'setStandingForAccount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: '_accounts', type: 'address[]' },
      { internalType: 'bool[]', name: '_standing', type: 'bool[]' },
    ],
    name: 'setStandingForAccounts',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: '_initData', type: 'bytes' }],
    name: 'setUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version_',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const HATS_MODULES_FACTORY_ABI = [
  {
    inputs: [
      { internalType: 'contract IHats', name: '_hats', type: 'address' },
      { internalType: 'string', name: '_version', type: 'string' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'BatchArrayLengthMismatch', type: 'error' },
  {
    inputs: [
      { internalType: 'address', name: 'implementation', type: 'address' },
      { internalType: 'uint256', name: 'hatId', type: 'uint256' },
      { internalType: 'bytes', name: 'otherImmutableArgs', type: 'bytes' },
      { internalType: 'uint256', name: 'saltNonce', type: 'uint256' },
    ],
    name: 'HatsModuleFactory_ModuleAlreadyDeployed',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'instance',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'hatId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'otherImmutableArgs',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'initData',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'saltNonce',
        type: 'uint256',
      },
    ],
    name: 'HatsModuleFactory_ModuleDeployed',
    type: 'event',
  },
  {
    inputs: [],
    name: 'HATS',
    outputs: [{ internalType: 'contract IHats', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_implementations',
        type: 'address[]',
      },
      { internalType: 'uint256[]', name: '_hatIds', type: 'uint256[]' },
      {
        internalType: 'bytes[]',
        name: '_otherImmutableArgsArray',
        type: 'bytes[]',
      },
      { internalType: 'bytes[]', name: '_initDataArray', type: 'bytes[]' },
      { internalType: 'uint256[]', name: '_saltNonces', type: 'uint256[]' },
    ],
    name: 'batchCreateHatsModule',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_implementation', type: 'address' },
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'bytes', name: '_otherImmutableArgs', type: 'bytes' },
      { internalType: 'bytes', name: '_initData', type: 'bytes' },
      { internalType: 'uint256', name: '_saltNonce', type: 'uint256' },
    ],
    name: 'createHatsModule',
    outputs: [{ internalType: 'address', name: '_instance', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_implementation', type: 'address' },
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'bytes', name: '_otherImmutableArgs', type: 'bytes' },
      { internalType: 'uint256', name: '_saltNonce', type: 'uint256' },
    ],
    name: 'deployed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_implementation', type: 'address' },
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'bytes', name: '_otherImmutableArgs', type: 'bytes' },
      { internalType: 'uint256', name: '_saltNonce', type: 'uint256' },
    ],
    name: 'getHatsModuleAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const ZODIAC_MODULE_PROXY_FACTORY_ABI = [
  { inputs: [], name: 'FailedInitialization', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'address_', type: 'address' }],
    name: 'TakenAddress',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'target', type: 'address' }],
    name: 'TargetHasNoCode',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'target', type: 'address' }],
    name: 'ZeroAddress',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'proxy',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'masterCopy',
        type: 'address',
      },
    ],
    name: 'ModuleProxyCreation',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address', name: 'masterCopy', type: 'address' },
      { internalType: 'bytes', name: 'initializer', type: 'bytes' },
      { internalType: 'uint256', name: 'saltNonce', type: 'uint256' },
    ],
    name: 'deployModule',
    outputs: [{ internalType: 'address', name: 'proxy', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const HSG_V2_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_hats', type: 'address' },
      { internalType: 'address', name: '_safeSingleton', type: 'address' },
      {
        internalType: 'address',
        name: '_safeFallbackLibrary',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_safeMultisendLibrary',
        type: 'address',
      },
      { internalType: 'address', name: '_safeProxyFactory', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [{ internalType: 'address', name: 'module', type: 'address' }],
    name: 'AlreadyDisabledModule',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'module', type: 'address' }],
    name: 'AlreadyEnabledModule',
    type: 'error',
  },
  { inputs: [], name: 'CannotCallSafe', type: 'error' },
  { inputs: [], name: 'CannotChangeFallbackHandler', type: 'error' },
  { inputs: [], name: 'CannotChangeModules', type: 'error' },
  { inputs: [], name: 'CannotChangeOwners', type: 'error' },
  { inputs: [], name: 'CannotChangeThreshold', type: 'error' },
  { inputs: [], name: 'CannotDisableThisGuard', type: 'error' },
  { inputs: [], name: 'DelegatecallTargetNotEnabled', type: 'error' },
  { inputs: [], name: 'InsufficientValidSignatures', type: 'error' },
  { inputs: [], name: 'InvalidArrayLength', type: 'error' },
  { inputs: [], name: 'InvalidInitialization', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'module', type: 'address' }],
    name: 'InvalidModule',
    type: 'error',
  },
  { inputs: [], name: 'InvalidPageSize', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'hatId', type: 'uint256' }],
    name: 'InvalidSignerHat',
    type: 'error',
  },
  { inputs: [], name: 'InvalidThresholdConfig', type: 'error' },
  { inputs: [], name: 'Locked', type: 'error' },
  { inputs: [], name: 'NoReentryAllowed', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'sender', type: 'address' }],
    name: 'NotAuthorized',
    type: 'error',
  },
  { inputs: [], name: 'NotCalledFromSafe', type: 'error' },
  { inputs: [], name: 'NotClaimableFor', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'guard', type: 'address' }],
    name: 'NotIERC165Compliant',
    type: 'error',
  },
  { inputs: [], name: 'NotInitializing', type: 'error' },
  { inputs: [], name: 'NotOwnerHatWearer', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'NotSignerHatWearer',
    type: 'error',
  },
  { inputs: [], name: 'ReregistrationNotAllowed', type: 'error' },
  { inputs: [], name: 'SafeTransactionFailed', type: 'error' },
  { inputs: [], name: 'SetupModulesAlreadyCalled', type: 'error' },
  { inputs: [], name: 'StillWearsSignerHat', type: 'error' },
  { inputs: [], name: 'ThresholdTooLow', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'guard',
        type: 'address',
      },
    ],
    name: 'ChangedGuard',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bool',
        name: 'claimableFor',
        type: 'bool',
      },
    ],
    name: 'ClaimableForSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
      { indexed: false, internalType: 'bool', name: 'enabled', type: 'bool' },
    ],
    name: 'DelegatecallTargetEnabled',
    type: 'event',
  },
  { anonymous: false, inputs: [], name: 'Detached', type: 'event' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
    ],
    name: 'DisabledModule',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
    ],
    name: 'EnabledModule',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
    ],
    name: 'ExecutionFromModuleFailure',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
    ],
    name: 'ExecutionFromModuleSuccess',
    type: 'event',
  },
  { anonymous: false, inputs: [], name: 'HSGLocked', type: 'event' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint64',
        name: 'version',
        type: 'uint64',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'newHSG',
        type: 'address',
      },
    ],
    name: 'Migrated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'ownerHat',
        type: 'uint256',
      },
    ],
    name: 'OwnerHatSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'hatId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'signer',
        type: 'address',
      },
    ],
    name: 'Registered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'newSignerHats',
        type: 'uint256[]',
      },
    ],
    name: 'SignerHatsAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: 'enum IHatsSignerGate.TargetThresholdType',
            name: 'thresholdType',
            type: 'uint8',
          },
          { internalType: 'uint120', name: 'min', type: 'uint120' },
          { internalType: 'uint120', name: 'target', type: 'uint120' },
        ],
        indexed: false,
        internalType: 'struct IHatsSignerGate.ThresholdConfig',
        name: 'thresholdConfig',
        type: 'tuple',
      },
    ],
    name: 'ThresholdConfigSet',
    type: 'event',
  },
  { stateMutability: 'nonpayable', type: 'fallback' },
  {
    inputs: [],
    name: 'HATS',
    outputs: [{ internalType: 'contract IHats', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256[]', name: '_newSignerHats', type: 'uint256[]' },
    ],
    name: 'addSignerHats',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract ISafe', name: '_safe', type: 'address' },
    ],
    name: 'canAttachToSafe',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'bool', name: '', type: 'bool' },
    ],
    name: 'checkAfterExecution',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
      { internalType: 'enum Enum.Operation', name: 'operation', type: 'uint8' },
      { internalType: 'uint256', name: 'safeTxGas', type: 'uint256' },
      { internalType: 'uint256', name: 'baseGas', type: 'uint256' },
      { internalType: 'uint256', name: 'gasPrice', type: 'uint256' },
      { internalType: 'address', name: 'gasToken', type: 'address' },
      {
        internalType: 'address payable',
        name: 'refundReceiver',
        type: 'address',
      },
      { internalType: 'bytes', name: 'signatures', type: 'bytes' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'checkTransaction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'claimSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'address', name: '_signer', type: 'address' },
    ],
    name: 'claimSignerFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256[]', name: '_hatIds', type: 'uint256[]' },
      { internalType: 'address[]', name: '_signers', type: 'address[]' },
    ],
    name: 'claimSignersFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimableFor',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'detachHSG',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_target', type: 'address' }],
    name: 'disableDelegatecallTarget',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'prevModule', type: 'address' },
      { internalType: 'address', name: 'module', type: 'address' },
    ],
    name: 'disableModule',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_target', type: 'address' }],
    name: 'enableDelegatecallTarget',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'module', type: 'address' }],
    name: 'enableModule',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'enabledDelegatecallTargets',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
      { internalType: 'enum Enum.Operation', name: 'operation', type: 'uint8' },
    ],
    name: 'execTransactionFromModule',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
      { internalType: 'enum Enum.Operation', name: 'operation', type: 'uint8' },
    ],
    name: 'execTransactionFromModuleReturnData',
    outputs: [
      { internalType: 'bool', name: 'success', type: 'bool' },
      { internalType: 'bytes', name: 'returnData', type: 'bytes' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getGuard',
    outputs: [{ internalType: 'address', name: '_guard', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'start', type: 'address' },
      { internalType: 'uint256', name: 'pageSize', type: 'uint256' },
    ],
    name: 'getModulesPaginated',
    outputs: [
      { internalType: 'address[]', name: 'array', type: 'address[]' },
      { internalType: 'address', name: 'next', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSafeDeployParamAddresses',
    outputs: [
      { internalType: 'address', name: '_safeSingleton', type: 'address' },
      {
        internalType: 'address',
        name: '_safeFallbackLibrary',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_safeMultisendLibrary',
        type: 'address',
      },
      { internalType: 'address', name: '_safeProxyFactory', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'guard',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'implementation',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_module', type: 'address' }],
    name: 'isModuleEnabled',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
    name: 'isValidSigner',
    outputs: [{ internalType: 'bool', name: 'valid', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'isValidSignerHat',
    outputs: [{ internalType: 'bool', name: 'valid', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lock',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'locked',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_newHSG', type: 'address' },
      { internalType: 'uint256[]', name: '_signerHatIds', type: 'uint256[]' },
      {
        internalType: 'address[]',
        name: '_signersToMigrate',
        type: 'address[]',
      },
    ],
    name: 'migrateToNewHSG',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes[]', name: 'data', type: 'bytes[]' }],
    name: 'multicall',
    outputs: [{ internalType: 'bytes[]', name: '', type: 'bytes[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ownerHat',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'registeredSignerHats',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_signer', type: 'address' }],
    name: 'removeSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'safe',
    outputs: [{ internalType: 'contract ISafe', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bool', name: '_claimableFor', type: 'bool' }],
    name: 'setClaimableFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_guard', type: 'address' }],
    name: 'setGuard',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_ownerHat', type: 'uint256' }],
    name: 'setOwnerHat',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'enum IHatsSignerGate.TargetThresholdType',
            name: 'thresholdType',
            type: 'uint8',
          },
          { internalType: 'uint120', name: 'min', type: 'uint120' },
          { internalType: 'uint120', name: 'target', type: 'uint120' },
        ],
        internalType: 'struct IHatsSignerGate.ThresholdConfig',
        name: '_config',
        type: 'tuple',
      },
    ],
    name: 'setThresholdConfig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes', name: 'initializeParams', type: 'bytes' },
    ],
    name: 'setUp',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'thresholdConfig',
    outputs: [
      {
        components: [
          {
            internalType: 'enum IHatsSignerGate.TargetThresholdType',
            name: 'thresholdType',
            type: 'uint8',
          },
          { internalType: 'uint120', name: 'min', type: 'uint120' },
          { internalType: 'uint120', name: 'target', type: 'uint120' },
        ],
        internalType: 'struct IHatsSignerGate.ThresholdConfig',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'validSignerCount',
    outputs: [
      { internalType: 'uint256', name: 'signerCount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const HATS_ABI = [
  {
    inputs: [
      { internalType: 'string', name: '_name', type: 'string' },
      { internalType: 'string', name: '_baseImageURI', type: 'string' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'hatId', type: 'uint256' }],
    name: 'AllHatsWorn',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'wearer', type: 'address' },
      { internalType: 'uint256', name: 'hatId', type: 'uint256' },
    ],
    name: 'AlreadyWearingHat',
    type: 'error',
  },
  { inputs: [], name: 'BatchArrayLengthMismatch', type: 'error' },
  { inputs: [], name: 'CircularLinkage', type: 'error' },
  { inputs: [], name: 'CrossTreeLinkage', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'hatId', type: 'uint256' }],
    name: 'HatDoesNotExist',
    type: 'error',
  },
  { inputs: [], name: 'HatNotActive', type: 'error' },
  { inputs: [], name: 'Immutable', type: 'error' },
  { inputs: [], name: 'InvalidHatId', type: 'error' },
  { inputs: [], name: 'InvalidUnlink', type: 'error' },
  { inputs: [], name: 'LinkageNotRequested', type: 'error' },
  { inputs: [], name: 'MaxLevelsReached', type: 'error' },
  { inputs: [], name: 'MaxLevelsReached', type: 'error' },
  { inputs: [], name: 'NewMaxSupplyTooLow', type: 'error' },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'uint256', name: 'hatId', type: 'uint256' },
    ],
    name: 'NotAdmin',
    type: 'error',
  },
  { inputs: [], name: 'NotAdminOrWearer', type: 'error' },
  { inputs: [], name: 'NotEligible', type: 'error' },
  { inputs: [], name: 'NotHatWearer', type: 'error' },
  { inputs: [], name: 'NotHatsEligibility', type: 'error' },
  { inputs: [], name: 'NotHatsToggle', type: 'error' },
  { inputs: [], name: 'StringTooLong', type: 'error' },
  { inputs: [], name: 'ZeroAddress', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      { indexed: false, internalType: 'bool', name: 'approved', type: 'bool' },
    ],
    name: 'ApprovalForAll',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'id', type: 'uint256' },
      {
        indexed: false,
        internalType: 'string',
        name: 'details',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'maxSupply',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'eligibility',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'toggle',
        type: 'address',
      },
      { indexed: false, internalType: 'bool', name: 'mutable_', type: 'bool' },
      {
        indexed: false,
        internalType: 'string',
        name: 'imageURI',
        type: 'string',
      },
    ],
    name: 'HatCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'hatId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'newDetails',
        type: 'string',
      },
    ],
    name: 'HatDetailsChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'hatId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newEligibility',
        type: 'address',
      },
    ],
    name: 'HatEligibilityChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'hatId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'newImageURI',
        type: 'string',
      },
    ],
    name: 'HatImageURIChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'hatId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'newMaxSupply',
        type: 'uint32',
      },
    ],
    name: 'HatMaxSupplyChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'hatId',
        type: 'uint256',
      },
    ],
    name: 'HatMutabilityChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'hatId',
        type: 'uint256',
      },
      { indexed: false, internalType: 'bool', name: 'newStatus', type: 'bool' },
    ],
    name: 'HatStatusChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'hatId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newToggle',
        type: 'address',
      },
    ],
    name: 'HatToggleChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint32',
        name: 'domain',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newAdmin',
        type: 'uint256',
      },
    ],
    name: 'TopHatLinkRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint32',
        name: 'domain',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newAdmin',
        type: 'uint256',
      },
    ],
    name: 'TopHatLinked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'ids',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]',
      },
    ],
    name: 'TransferBatch',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'id', type: 'uint256' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'TransferSingle',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'string', name: 'value', type: 'string' },
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
    ],
    name: 'URI',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'hatId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'wearer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'wearerStanding',
        type: 'bool',
      },
    ],
    name: 'WearerStandingChanged',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'uint32', name: '_topHatDomain', type: 'uint32' },
      { internalType: 'uint256', name: '_newAdminHat', type: 'uint256' },
      { internalType: 'address', name: '_eligibility', type: 'address' },
      { internalType: 'address', name: '_toggle', type: 'address' },
      { internalType: 'string', name: '_details', type: 'string' },
      { internalType: 'string', name: '_imageURI', type: 'string' },
    ],
    name: 'approveLinkTopHatToTree',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'badStandings',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_wearer', type: 'address' },
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: '_wearers', type: 'address[]' },
      { internalType: 'uint256[]', name: '_hatIds', type: 'uint256[]' },
    ],
    name: 'balanceOfBatch',
    outputs: [
      { internalType: 'uint256[]', name: 'balances', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'baseImageURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256[]', name: '_admins', type: 'uint256[]' },
      { internalType: 'string[]', name: '_details', type: 'string[]' },
      { internalType: 'uint32[]', name: '_maxSupplies', type: 'uint32[]' },
      {
        internalType: 'address[]',
        name: '_eligibilityModules',
        type: 'address[]',
      },
      { internalType: 'address[]', name: '_toggleModules', type: 'address[]' },
      { internalType: 'bool[]', name: '_mutables', type: 'bool[]' },
      { internalType: 'string[]', name: '_imageURIs', type: 'string[]' },
    ],
    name: 'batchCreateHats',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256[]', name: '_hatIds', type: 'uint256[]' },
      { internalType: 'address[]', name: '_wearers', type: 'address[]' },
    ],
    name: 'batchMintHats',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_admin', type: 'uint256' },
      { internalType: 'uint16', name: '_newHat', type: 'uint16' },
    ],
    name: 'buildHatId',
    outputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'string', name: '_newDetails', type: 'string' },
    ],
    name: 'changeHatDetails',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'address', name: '_newEligibility', type: 'address' },
    ],
    name: 'changeHatEligibility',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'string', name: '_newImageURI', type: 'string' },
    ],
    name: 'changeHatImageURI',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'uint32', name: '_newMaxSupply', type: 'uint32' },
    ],
    name: 'changeHatMaxSupply',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'address', name: '_newToggle', type: 'address' },
    ],
    name: 'changeHatToggle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'checkHatStatus',
    outputs: [{ internalType: 'bool', name: 'toggled', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'address', name: '_wearer', type: 'address' },
    ],
    name: 'checkHatWearerStatus',
    outputs: [{ internalType: 'bool', name: 'updated', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_admin', type: 'uint256' },
      { internalType: 'string', name: '_details', type: 'string' },
      { internalType: 'uint32', name: '_maxSupply', type: 'uint32' },
      { internalType: 'address', name: '_eligibility', type: 'address' },
      { internalType: 'address', name: '_toggle', type: 'address' },
      { internalType: 'bool', name: '_mutable', type: 'bool' },
      { internalType: 'string', name: '_imageURI', type: 'string' },
    ],
    name: 'createHat',
    outputs: [{ internalType: 'uint256', name: 'newHatId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'uint32', name: '_level', type: 'uint32' },
    ],
    name: 'getAdminAtLevel',
    outputs: [{ internalType: 'uint256', name: 'admin', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'uint32', name: '_level', type: 'uint32' },
    ],
    name: 'getAdminAtLocalLevel',
    outputs: [{ internalType: 'uint256', name: 'admin', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'getHatEligibilityModule',
    outputs: [
      { internalType: 'address', name: 'eligibility', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'getHatLevel',
    outputs: [{ internalType: 'uint32', name: 'level', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'getHatMaxSupply',
    outputs: [{ internalType: 'uint32', name: 'maxSupply', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'getHatToggleModule',
    outputs: [{ internalType: 'address', name: 'toggle', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'getImageURIForHat',
    outputs: [{ internalType: 'string', name: '_uri', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'getLocalHatLevel',
    outputs: [{ internalType: 'uint32', name: 'level', type: 'uint32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_admin', type: 'uint256' }],
    name: 'getNextId',
    outputs: [{ internalType: 'uint256', name: 'nextId', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: '_topHatDomain', type: 'uint32' }],
    name: 'getTippyTopHatDomain',
    outputs: [{ internalType: 'uint32', name: 'domain', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'getTopHatDomain',
    outputs: [{ internalType: 'uint32', name: 'domain', type: 'uint32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'hatSupply',
    outputs: [{ internalType: 'uint32', name: 'supply', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'isActive',
    outputs: [{ internalType: 'bool', name: 'active', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_user', type: 'address' },
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
    ],
    name: 'isAdminOfHat',
    outputs: [{ internalType: 'bool', name: 'isAdmin', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_wearer', type: 'address' },
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
    ],
    name: 'isEligible',
    outputs: [{ internalType: 'bool', name: 'eligible', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_wearer', type: 'address' },
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
    ],
    name: 'isInGoodStanding',
    outputs: [{ internalType: 'bool', name: 'standing', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'isLocalTopHat',
    outputs: [{ internalType: 'bool', name: '_isLocalTopHat', type: 'bool' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'isTopHat',
    outputs: [{ internalType: 'bool', name: '_isTopHat', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'isValidHatId',
    outputs: [{ internalType: 'bool', name: 'validHatId', type: 'bool' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_user', type: 'address' },
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
    ],
    name: 'isWearerOfHat',
    outputs: [{ internalType: 'bool', name: 'isWearer', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastTopHatId',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    name: 'linkedTreeAdmins',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    name: 'linkedTreeRequests',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'makeHatImmutable',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'address', name: '_wearer', type: 'address' },
    ],
    name: 'mintHat',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_target', type: 'address' },
      { internalType: 'string', name: '_details', type: 'string' },
      { internalType: 'string', name: '_imageURI', type: 'string' },
    ],
    name: 'mintTopHat',
    outputs: [{ internalType: 'uint256', name: 'topHatId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes[]', name: 'data', type: 'bytes[]' }],
    name: 'multicall',
    outputs: [{ internalType: 'bytes[]', name: '', type: 'bytes[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint32', name: '_topHatDomain', type: 'uint32' },
      { internalType: 'uint256', name: '_linkedAdmin', type: 'uint256' },
    ],
    name: 'noCircularLinkage',
    outputs: [{ internalType: 'bool', name: 'notCircular', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint32', name: '_topHatDomain', type: 'uint32' },
      { internalType: 'uint256', name: '_newAdminHat', type: 'uint256' },
      { internalType: 'address', name: '_eligibility', type: 'address' },
      { internalType: 'address', name: '_toggle', type: 'address' },
      { internalType: 'string', name: '_details', type: 'string' },
      { internalType: 'string', name: '_imageURI', type: 'string' },
    ],
    name: 'relinkTopHatWithinTree',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'renounceHat',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint32', name: '_topHatDomain', type: 'uint32' },
      { internalType: 'uint256', name: '_requestedAdminHat', type: 'uint256' },
    ],
    name: 'requestLinkTopHatToTree',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256[]', name: '', type: 'uint256[]' },
      { internalType: 'uint256[]', name: '', type: 'uint256[]' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'safeBatchTransferFrom',
    outputs: [],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint32', name: '_topHatDomain', type: 'uint32' },
      { internalType: 'uint256', name: '_newAdminHat', type: 'uint256' },
    ],
    name: 'sameTippyTopHatDomain',
    outputs: [{ internalType: 'bool', name: 'sameDomain', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bool', name: '', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'bool', name: '_newStatus', type: 'bool' },
    ],
    name: 'setHatStatus',
    outputs: [{ internalType: 'bool', name: 'toggled', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'address', name: '_wearer', type: 'address' },
      { internalType: 'bool', name: '_eligible', type: 'bool' },
      { internalType: 'bool', name: '_standing', type: 'bool' },
    ],
    name: 'setHatWearerStatus',
    outputs: [{ internalType: 'bool', name: 'updated', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_hatId', type: 'uint256' },
      { internalType: 'address', name: '_from', type: 'address' },
      { internalType: 'address', name: '_to', type: 'address' },
    ],
    name: 'transferHat',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint32', name: '_topHatDomain', type: 'uint32' },
      { internalType: 'address', name: '_wearer', type: 'address' },
    ],
    name: 'unlinkTopHatFromTree',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
    name: 'uri',
    outputs: [{ internalType: 'string', name: '_uri', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_hatId', type: 'uint256' }],
    name: 'viewHat',
    outputs: [
      { internalType: 'string', name: 'details', type: 'string' },
      { internalType: 'uint32', name: 'maxSupply', type: 'uint32' },
      { internalType: 'uint32', name: 'supply', type: 'uint32' },
      { internalType: 'address', name: 'eligibility', type: 'address' },
      { internalType: 'address', name: 'toggle', type: 'address' },
      { internalType: 'string', name: 'imageURI', type: 'string' },
      { internalType: 'uint16', name: 'lastHatId', type: 'uint16' },
      { internalType: 'bool', name: 'mutable_', type: 'bool' },
      { internalType: 'bool', name: 'active', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const MULTICALL3_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct Multicall3.Call[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'aggregate',
    outputs: [
      { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
      { internalType: 'bytes[]', name: 'returnData', type: 'bytes[]' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'bool', name: 'allowFailure', type: 'bool' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct Multicall3.Call3[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'aggregate3',
    outputs: [
      {
        components: [
          { internalType: 'bool', name: 'success', type: 'bool' },
          { internalType: 'bytes', name: 'returnData', type: 'bytes' },
        ],
        internalType: 'struct Multicall3.Result[]',
        name: 'returnData',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'bool', name: 'allowFailure', type: 'bool' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct Multicall3.Call3Value[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'aggregate3Value',
    outputs: [
      {
        components: [
          { internalType: 'bool', name: 'success', type: 'bool' },
          { internalType: 'bytes', name: 'returnData', type: 'bytes' },
        ],
        internalType: 'struct Multicall3.Result[]',
        name: 'returnData',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct Multicall3.Call[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'blockAndAggregate',
    outputs: [
      { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
      { internalType: 'bytes32', name: 'blockHash', type: 'bytes32' },
      {
        components: [
          { internalType: 'bool', name: 'success', type: 'bool' },
          { internalType: 'bytes', name: 'returnData', type: 'bytes' },
        ],
        internalType: 'struct Multicall3.Result[]',
        name: 'returnData',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBasefee',
    outputs: [{ internalType: 'uint256', name: 'basefee', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'blockNumber', type: 'uint256' }],
    name: 'getBlockHash',
    outputs: [{ internalType: 'bytes32', name: 'blockHash', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBlockNumber',
    outputs: [
      { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getChainId',
    outputs: [{ internalType: 'uint256', name: 'chainid', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCurrentBlockCoinbase',
    outputs: [{ internalType: 'address', name: 'coinbase', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCurrentBlockDifficulty',
    outputs: [{ internalType: 'uint256', name: 'difficulty', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCurrentBlockGasLimit',
    outputs: [{ internalType: 'uint256', name: 'gaslimit', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCurrentBlockTimestamp',
    outputs: [{ internalType: 'uint256', name: 'timestamp', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'getEthBalance',
    outputs: [{ internalType: 'uint256', name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getLastBlockHash',
    outputs: [{ internalType: 'bytes32', name: 'blockHash', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bool', name: 'requireSuccess', type: 'bool' },
      {
        components: [
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct Multicall3.Call[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'tryAggregate',
    outputs: [
      {
        components: [
          { internalType: 'bool', name: 'success', type: 'bool' },
          { internalType: 'bytes', name: 'returnData', type: 'bytes' },
        ],
        internalType: 'struct Multicall3.Result[]',
        name: 'returnData',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bool', name: 'requireSuccess', type: 'bool' },
      {
        components: [
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct Multicall3.Call[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'tryBlockAndAggregate',
    outputs: [
      { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
      { internalType: 'bytes32', name: 'blockHash', type: 'bytes32' },
      {
        components: [
          { internalType: 'bool', name: 'success', type: 'bool' },
          { internalType: 'bytes', name: 'returnData', type: 'bytes' },
        ],
        internalType: 'struct Multicall3.Result[]',
        name: 'returnData',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export const ERC20_ELIGIBILITY_ABI = [
  {
    inputs: [{ internalType: 'string', name: '_version', type: 'string' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'AlreadyInitialized', type: 'error' },
  { inputs: [], name: 'NotInitializing', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    inputs: [],
    name: 'ERC20_TOKEN_ADDRESS',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'HATS',
    outputs: [{ internalType: 'contract IHats', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'IMPLEMENTATION',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MIN_BALANCE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_wearer', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'getWearerStatus',
    outputs: [
      { internalType: 'bool', name: 'eligible', type: 'bool' },
      { internalType: 'bool', name: 'standing', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'hatId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: '_initData', type: 'bytes' }],
    name: 'setUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version_',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const FALLBACK_ARG_EXAMPLES = {
  address: '0x3bc1A0Ad72417f2d41...',
  number: '10',
  booleanOption: ['True', 'False'],
};

export const MODULE_ARG_BOOLEAN_OPTION_SETS = {
  standing: ['Good Standing', 'Bad Standing'],
  eligibility: ['Eligible', 'Ineligible'],
  status: ['Active', 'Inactive'],
};

export const TOKEN_ARG_TYPES = ['erc20', 'token'];

export const numberTypes = [
  'uint256',
  'uint8',
  'uint16',
  'uint32',
  'uint64',
  'uint128',
  'uint248',
];

const eligibilityModule = (name: string) => `${name} Eligibility`;
export const ELIGIBILITY_MODULES = {
  agreement: eligibilityModule('Agreement'),
  allowlist: eligibilityModule('Allowlist'),
  election: eligibilityModule('Hats Election'),
  erc20: eligibilityModule('ERC20'),
  erc721: eligibilityModule('ERC721'),
  erc1155: eligibilityModule('ERC1155'),
  hatWearing: eligibilityModule('Hat Wearing'),
  jokerace: eligibilityModule('JokeRace'),
  passthrough: 'Passthrough Module',
  staking: eligibilityModule('Staking'),
  // meta modules
  eligibilityChain: 'Eligibilities Chain',
};

export const TOGGLE_MODULES = {
  passthrough: 'Passthrough Module',
  season: 'Season Toggle',
};


import { Hex } from "viem";

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

/**
 * Implementation address for known Eligibility modules. Uses an array to handle multiple implementations.
 */
export const KNOWN_ELIGIBILITY_MODULES: { [key: string]: Hex[] } = {
  agreement: [
    "0x8126d02F4EcDE43eca4543a0D90B755C3E225F09",
    "0xF6bc6Dd30403e6ff5b3Bebead32B8fce1b753aA1" // deprecated
  ],
  allowlist: [
    "0x5302757E4CEAD88d52D014113FCC8cb51dd36255",
    "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5", // deprecated
  ],
  election: [
    "0xd3b916a8F0C4f9D1d5B6Af29c3C012dbd4f3149E",
    "0x99081d45920818557203CCD62eD36dC2FaD9a43E" // deprecated
  ],
  jokeRace: [
    "0xAE0e56A0c509dA713722c1aFFcF4B5f1C6CDc73a",
    "0x2bb30E1786a656EC6cD81e79EEf1A28607c9AE5A" // deprecated
  ],
  staking: ["0x9E01030aF633Be5a439DF122F2eEf750b44B8aC7"],
  // basic modules (no authorities given)
  erc20: ["0xbA5b218e6685D0607139c06f81442681a32a0EC3"],
  erc721: ["0xF37cf12fB4493D29270806e826fDDf50dd722bab"],
  erc1155: ["0x0089FbD2e0c42F2090890e1d9A3bd8d40E0e2e17"],
  hatWearing: ["0xa2e614CE4FAaD60e266127F4006b812d69977265"],
  // meta modules
  eligibilityChain: ["0x83200f1633cDb6C8f28F202CEA1B6a9105862D83"],
  toggleChain: ["0x2f1388e095BEc051dB9F1B226Faf222ef5c33f16"],
}

/**
 * Implementation address for known Toggle modules. Uses an array to handle multiple implementations.
 */
export const KNOWN_TOGGLE_MODULES: { [key: string]: Hex[] } = {
  season: ["0xFb6bD2e96B123d0854064823f6cb59420A285C00"],
  toggleChain: ["0x2f1388e095BEc051dB9F1B226Faf222ef5c33f16"],
}

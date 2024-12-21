import { Abi } from 'viem';

export const MODULE_INTERFACE = [
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
  // {
  //   inputs: [],
  //   name: 'version',
  //   outputs: [{ internalType: 'string', name: '', type: 'string' }],
  //   stateMutability: 'view',
  //   type: 'function',
  // },
  // {
  //   inputs: [],
  //   name: 'version_',
  //   outputs: [{ internalType: 'string', name: '', type: 'string' }],
  //   stateMutability: 'view',
  //   type: 'function',
  // },
] as Abi;

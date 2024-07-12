import { NETWORK_ENDPOINTS } from '@hatsprotocol/constants';
import { HatsAccount1ofNClient } from '@hatsprotocol/hats-account-sdk';
import { HatsSignerGateClient } from '@hatsprotocol/hsg-sdk';
import { HatsModulesClient } from '@hatsprotocol/modules-sdk';
import { HatsClient } from '@hatsprotocol/sdk-v1-core';
import { HatsSubgraphClient } from '@hatsprotocol/sdk-v1-subgraph';
import { createPublicClient, http } from 'viem';
import { getWalletClient } from 'wagmi/actions';

import { chainsMap, getRpcUrl, wagmiConfig } from './chains';

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!WC_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_WC_PROJECT_ID is not set');
}
const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;
if (!ALCHEMY_ID) {
  throw new Error('NEXT_PUBLIC_ALCHEMY_ID is not set');
}

declare global {
  interface Window {
    // @ts-expect-error - overlapping with definition from Coinbase wallet for some reason
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any;
  }
}

export const viemPublicClient = (chainId: number) => {
  return createPublicClient({
    chain: chainsMap(chainId),
    transport: http(getRpcUrl(chainId), { batch: true }),
  });
};

export async function createHatsClient(
  chainId: number | undefined,
): Promise<HatsClient | undefined> {
  if (!chainId) return undefined;

  const publicClient = viemPublicClient(chainId);
  const walletClient = await getWalletClient(wagmiConfig);

  const hatsClient = new HatsClient({
    chainId,
    publicClient,
    walletClient,
  });

  return hatsClient;
}

export function createSubgraphClient(): HatsSubgraphClient {
  if (process.env.NODE_ENV === 'development') {
    return new HatsSubgraphClient({});
  }

  return new HatsSubgraphClient({ config: NETWORK_ENDPOINTS });
}

export async function createHatsModulesClient(
  chainId: number | undefined,
): Promise<HatsModulesClient | undefined> {
  if (!chainId) return undefined;

  const publicClient = viemPublicClient(chainId);
  const walletClient = await getWalletClient(wagmiConfig);

  const hatsModulesClient = new HatsModulesClient({
    publicClient,
    walletClient,
  });

  // Will look up all modules in registry but can be configired to
  // handle a specific module if passed as argument
  await hatsModulesClient.prepare({
    modules: [
      {
        name: 'Unlock Protocol Eligibility (PublicLock V14)',
        details: [
          'Use this module to make a hat only wearable by addresses that have purchased an Unlock Protocol key NFT.',
          'Deploying this module will also create a new lock contract (Public Lock version 14), and will automatically mint a hat to the recipient of a newly purchased key.',
        ],
        links: [
          {
            label: 'GitHub',
            link: 'https://github.com/Hats-Protocol/unlock-eligibility',
          },
        ],
        parameters: [
          {
            label: 'Referrer',
            functionName: 'FEE_SPLIT_RECIPIENT',
            displayType: 'address',
          },
          {
            label: 'Referrer Fee Percentage',
            functionName: 'FEE_SPLIT_PERCENTAGE',
            displayType: 'uint256',
          },
          {
            label: 'Lock Contract',
            functionName: 'lock',
            displayType: 'address',
          },
          {
            label: 'Price',
            functionName: 'keyPrice',
            displayType: 'amountWithDecimals',
          },
          // {
          //   label: 'Token',
          //   functionName: 'keyPurchaseToken',
          //   displayType: 'token',
          // },
          // {
          //   label: 'Renewal Period',
          //   functionName: 'expirationDuration',
          //   displayType: 'seconds',
          // },
          // {
          //   label: 'Max Purchasers',
          //   functionName: 'maxNumberOfKeys',
          //   displayType: 'default',
          // },
        ],
        type: {
          eligibility: true,
          toggle: false,
          hatter: true,
        },
        tags: [],
        implementationAddress: '0x51C4803BDF1f239E488AA5180f07D4469D33cCa3',
        deployments: [
          {
            chainId: '5',
            block: '0',
          },
          {
            chainId: '11155111',
            block: '6228828',
          },
          {
            chainId: '10',
            block: '0',
          },
          {
            chainId: '137',
            block: '0',
          },
          {
            chainId: '42161',
            block: '0',
          },
          {
            chainId: '100',
            block: '0',
          },
          {
            chainId: '8453',
            block: '0',
          },
          {
            chainId: '42220',
            block: '0',
          },
        ],
        creationArgs: {
          useHatId: true,
          immutable: [],
          mutable: [
            {
              name: 'Renewal Period',
              description: 'How often a payment must be made to keep the hat',
              type: 'uint256',
              example: '2592000',
              displayType: 'seconds',
            },
            {
              name: 'Payment Token',
              description: 'The token used to make payments',
              type: 'address',
              example: '0x1d256A1154382921067d4B17CA52209f2d3bE106',
              displayType: 'token',
            },
            {
              name: 'Payment Price',
              description: 'The price of a payment for a single renewal period',
              type: 'uint256',
              example: '5000000000000000000',
              displayType: 'amountWithDecimals',
            },
            {
              name: 'Max Purchasers',
              description:
                'The maximum number of addresses that can pay for this hat. Suggested greater than or equal to the max wearers for this hat.',
              type: 'uint256',
              example: '100',
              displayType: 'default',
            },
            {
              name: 'Lock Manager',
              description:
                "The manager of the lock contract, who can modify many of the lock's settings.",
              type: 'address',
              example: '0x1d256A1154382921067d4B17CA52209f2d3bE106',
              displayType: 'address',
            },
            {
              name: 'Lock Name',
              description:
                'The name of the lock NFT. Suggested to include the name of this hat.',
              type: 'string',
              example: 'My Hat Lock',
              displayType: 'default',
            },
          ],
        },
        customRoles: [],
        writeFunctions: [],
        abi: [
          {
            inputs: [
              { internalType: 'string', name: '_version', type: 'string' },
              {
                internalType: 'address',
                name: '_feeSplitRecipient',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: '_feeSplitPercentage',
                type: 'uint256',
              },
            ],
            stateMutability: 'nonpayable',
            type: 'constructor',
          },
          { inputs: [], name: 'NotLock', type: 'error' },
          { inputs: [], name: 'UnsupportedNetwork', type: 'error' },
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,
                internalType: 'uint8',
                name: 'version',
                type: 'uint8',
              },
            ],
            name: 'Initialized',
            type: 'event',
          },
          {
            inputs: [],
            name: 'DEFAULT_LOCK_VERSION',
            outputs: [{ internalType: 'uint16', name: '', type: 'uint16' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'FEE_SPLIT_PERCENTAGE',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'FEE_SPLIT_RECIPIENT',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'HATS',
            outputs: [
              { internalType: 'contract IHats', name: '', type: 'address' },
            ],
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
            name: 'getUnlockContract',
            outputs: [
              { internalType: 'contract IUnlock', name: '', type: 'address' },
            ],
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
            inputs: [],
            name: 'keyPrice',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'address', name: '', type: 'address' },
              { internalType: 'address', name: '', type: 'address' },
              { internalType: 'address', name: '', type: 'address' },
              { internalType: 'bytes', name: '', type: 'bytes' },
            ],
            name: 'keyPurchasePrice',
            outputs: [
              { internalType: 'uint256', name: 'minKeyPrice', type: 'uint256' },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'lock',
            outputs: [
              {
                internalType: 'contract IPublicLock',
                name: '',
                type: 'address',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'uint256', name: '', type: 'uint256' },
              { internalType: 'address', name: '', type: 'address' },
              { internalType: 'address', name: 'recipient', type: 'address' },
              { internalType: 'address', name: '', type: 'address' },
              { internalType: 'bytes', name: '', type: 'bytes' },
              { internalType: 'uint256', name: '', type: 'uint256' },
              { internalType: 'uint256', name: '', type: 'uint256' },
            ],
            name: 'onKeyPurchase',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
          {
            inputs: [
              { internalType: 'bytes', name: '_initData', type: 'bytes' },
            ],
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
        ],
      },
    ],
  });

  return hatsModulesClient as HatsModulesClient;
}

export async function createHatsSignerGateClient(
  chainId: number | undefined,
): Promise<HatsSignerGateClient | undefined> {
  if (!chainId) return undefined;

  const publicClient = viemPublicClient(chainId);
  const walletClient = await getWalletClient(wagmiConfig);

  const hatsModulesClient = new HatsSignerGateClient({
    publicClient,
    walletClient,
  });

  return hatsModulesClient as HatsSignerGateClient;
}

export async function createHatsAccountClient(
  chainId: number | undefined,
): Promise<HatsAccount1ofNClient | undefined> {
  if (!chainId) return undefined;

  const publicClient = viemPublicClient(chainId);
  const walletClient = await getWalletClient(wagmiConfig);

  const hatsAccountClient = new HatsAccount1ofNClient({
    publicClient,
    walletClient,
  });

  return hatsAccountClient as HatsAccount1ofNClient;
}

export * from './chains';

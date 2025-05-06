import { MANUAL_EXCLUDE_TOKENS, SAFE_API_URL } from '@hatsprotocol/config';
import { SAFE_ABI } from '@hatsprotocol/constants';
import SafeApiKit from '@safe-global/api-kit';
import { every, filter, first, get, includes, isEmpty, map, reject, some, toNumber } from 'lodash';
import { SupportedChains } from 'types';
import { getAddress, Hex } from 'viem';

import { logger } from '../logs';
import { viemPublicClient } from '../web3';

export const createSafeApiKit = (chainId: bigint) => {
  if (!SAFE_API_URL[toNumber(chainId.toString()) as keyof typeof SAFE_API_URL])
    throw new Error(`Unsupported chainId: ${chainId}`);

  return new SafeApiKit({
    chainId,
  });
};

export const fetchPendingSafeTransactions = async ({
  safeAddress,
  chainId,
}: {
  safeAddress: Hex | undefined;
  chainId: number | undefined;
}): Promise<any | null> => {
  if (!safeAddress || !chainId) return null;

  try {
    const safeKit = createSafeApiKit(BigInt(chainId));

    const pendingTxs = await safeKit.getPendingTransactions(getAddress(safeAddress), {
      limit: 100,
      offset: 0,
      ordering: 'created',
    });

    return pendingTxs.results;
  } catch (error) {
    console.error('Error fetching pending Safe transactions:', error);
    return null;
  }
};

export const fetchSafesInfo = async ({ safes, chainId }: { safes: Hex[] | undefined; chainId: number | undefined }) => {
  if (!chainId || isEmpty(safes)) return null;
  // const safeKit = createSafeApiKit(BigInt(chainId));

  // const promises = map(safes, (s) => safeKit.getSafeInfo(getAddress(s)));
  const publicClient = viemPublicClient(chainId);
  const multicall = await publicClient.multicall({
    contracts: map(safes, (s) => ({
      abi: SAFE_ABI,
      address: getAddress(s),
      functionName: 'getOwners',
    })),
  });

  return map(multicall, 'result');
};

export const fetchSafeTokens = async (safeAddress: Hex | undefined, chainId: number | undefined) => {
  if (!safeAddress || !chainId) return null;

  return fetch(`${SAFE_API_URL[chainId as SupportedChains]}/api/v2/safes/${getAddress(safeAddress)}/balances`)
    .then((res) => res.json())
    .then((data) => data.results);
};

export const fetchSafeTransactions = async ({
  safeAddress,
  chainId,
}: {
  safeAddress: Hex | undefined;
  chainId: number | undefined;
}) => {
  if (!safeAddress || !chainId) return null;
  const apiUrl = SAFE_API_URL[chainId as keyof typeof SAFE_API_URL];
  // use appropriate URL
  return fetch(`${apiUrl}/api/v1/safes/${getAddress(safeAddress)}/all-transactions/?limit=100&offset=0`)
    .then((res) => res.json())
    .then((data) => get(data, 'results'));
};

interface Transaction {
  transfers: {
    from: Hex;
    to: Hex;
    tokenAddress: Hex;
    type: string;
  }[];
}

export const onlyInboundTransactions = (transactions: Transaction[], safeAddress: Hex) => {
  return filter(
    transactions,
    (tx) =>
      some(tx.transfers, (transfer) => transfer.to === getAddress(safeAddress)) &&
      every(tx.transfers, (transfer) => transfer.type !== 'ERC721_TRANSFER'),
  );
};

export const onlyOutboundTransactions = (transactions: Transaction[], safeAddress: Hex) => {
  return filter(transactions, (tx) => some(tx.transfers, (transfer) => transfer.from === getAddress(safeAddress)));
};

export const findLastInboundTransaction = (transactions: Transaction[], safeAddress: Hex) => {
  const inboundTx = onlyInboundTransactions(transactions, safeAddress);
  return first(inboundTx);
};

export const findLastOutboundTransaction = (transactions: Transaction[], safeAddress: Hex) => {
  const outboundTx = onlyOutboundTransactions(transactions, safeAddress);
  return first(outboundTx);
};

export const filterSafeTransactions = (
  transactions: Transaction[] | undefined,
  approvedTokens: string[] | undefined,
) => {
  // filter manual exclude
  const manualExcluded = reject(transactions, (tx) =>
    includes(MANUAL_EXCLUDE_TOKENS, get(tx, 'transfers.0.tokenAddress')),
  );

  return filter(manualExcluded, (tx) => includes(approvedTokens, get(tx, 'transfers.0.tokenInfo.symbol')));
};

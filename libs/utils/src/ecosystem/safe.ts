import { MANUAL_EXCLUDE_TOKENS, SAFE_API_URL } from '@hatsprotocol/constants';
import SafeApiKit from '@safe-global/api-kit';
import {
  every,
  filter,
  first,
  get,
  includes,
  isEmpty,
  map,
  reject,
  some,
  toNumber,
} from 'lodash';
import { SupportedChains } from 'types';
import { getAddress, Hex } from 'viem';

export const createSafeApiKit = (chainId: bigint) => {
  if (!SAFE_API_URL[toNumber(chainId.toString()) as keyof typeof SAFE_API_URL])
    throw new Error(`Unsupported chainId: ${chainId}`);

  return new SafeApiKit({
    chainId,
  });
};

export const fetchSafesInfo = async ({
  safes,
  chainId,
}: {
  safes: Hex[] | undefined;
  chainId: number | undefined;
}) => {
  if (!chainId || isEmpty(safes)) return null;
  const safeKit = createSafeApiKit(BigInt(chainId));

  const promises = map(safes, (s) => safeKit.getSafeInfo(getAddress(s)));

  const result = await Promise.all(promises);
  return result;
};

export const fetchSafeTokens = async (
  safeAddress: Hex | undefined,
  chainId: number | undefined,
) => {
  if (!safeAddress || !chainId) return null;

  return fetch(
    `${SAFE_API_URL[chainId as SupportedChains]}/api/v2/safes/${getAddress(
      safeAddress,
    )}/balances`,
  )
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
  return fetch(
    `${apiUrl}/api/v1/safes/${getAddress(safeAddress)}/all-transactions/?limit=100&offset=0`,
  )
    .then((res) => res.json())
    .then((data) => get(data, 'results'));
};

export const onlyInboundTransactions = (
  transactions: any[],
  safeAddress: Hex,
) => {
  return filter(
    transactions,
    (tx) =>
      some(
        tx.transfers,
        (transfer) => transfer.to === getAddress(safeAddress),
      ) &&
      every(tx.transfers, (transfer) => transfer.type !== 'ERC721_TRANSFER'),
  );
};

export const onlyOutboundTransactions = (
  transactions: any[],
  safeAddress: Hex,
) => {
  return filter(transactions, (tx) =>
    some(tx.transfers, (transfer) => transfer.from === getAddress(safeAddress)),
  );
};

export const findLastInboundTransaction = (
  transactions: any[],
  safeAddress: Hex,
) => {
  console.log('transactions', transactions);
  const inboundTx = onlyInboundTransactions(transactions, safeAddress);
  return first(inboundTx);
};

export const findLastOutboundTransaction = (
  transactions: any[],
  safeAddress: Hex,
) => {
  const outboundTx = onlyOutboundTransactions(transactions, safeAddress);
  return first(outboundTx);
};

export const filterSafeTransactions = (
  transactions: any[] | undefined,
  approvedTokens: string[] | undefined,
) => {
  // filter manual exclude
  const manualExcluded = reject(transactions, (tx) =>
    includes(MANUAL_EXCLUDE_TOKENS, get(tx, 'transfers.0.tokenAddress')),
  );

  return filter(manualExcluded, (tx) =>
    includes(approvedTokens, get(tx, 'transfers.0.tokenInfo.symbol')),
  );
};

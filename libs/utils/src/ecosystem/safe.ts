import { SAFE_API_URL } from '@hatsprotocol/constants';
import SafeApiKit from '@safe-global/api-kit';
import { get, isEmpty, map, toNumber } from 'lodash';
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
  // use appropriate URL
  return fetch(
    `${
      SAFE_API_URL[chainId as keyof typeof SAFE_API_URL]
    }/api/v1/safes/${getAddress(safeAddress)}/all-transactions/`,
  )
    .then((res) => res.json())
    .then((data) => get(data, 'results'));
};

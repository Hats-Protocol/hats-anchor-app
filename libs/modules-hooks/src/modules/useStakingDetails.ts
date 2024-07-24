import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { find, get, map, reduce } from 'lodash';
import { ModuleDetails } from 'types';
import { viemPublicClient } from 'utils';
import { erc20Abi, formatUnits, Hex } from 'viem';

type Stake = {
  amount: bigint;
  slashed: boolean;
};

interface TokenDetails {
  symbol: string | undefined;
  name: string | undefined;
  decimals: number | undefined;
}

const fetchStakingDetails = async ({
  moduleDetails,
  tokenAddress,
  chainId,
  wearer,
}: {
  moduleDetails: ModuleDetails | undefined;
  tokenAddress: Hex | undefined;
  chainId: number | undefined;
  wearer: Hex | undefined;
}) => {
  const abi = get(moduleDetails, 'abi');
  if (!tokenAddress || !abi || !chainId) return Promise.resolve(undefined);
  const tokenFields = ['symbol', 'name', 'decimals'];
  const tokenFieldContracts = map(tokenFields, (field) => ({
    address: tokenAddress,
    abi: erc20Abi,
    chainId,
    functionName: field,
  }));

  const promises: Promise<unknown>[] = [
    // fetch staking token details
    viemPublicClient(chainId).multicall({
      contracts: tokenFieldContracts,
    }),
  ];
  if (wearer) {
    // check stakes if wearer is provided
    promises.push(
      viemPublicClient(chainId)
        .readContract({
          address: tokenAddress,
          abi,
          functionName: 'stakes',
          args: [wearer],
        })
        .then((stake: unknown) => {
          return Promise.resolve(stake as Stake);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Error fetching stakes', error);
          return Promise.resolve(undefined);
        }),
    );
  }
  const result = await Promise.all(promises);
  const [tokenDetailsResult, stakeBalance] = result as [
    { result: unknown; status: string }[],
    Stake,
  ];
  const tokenDetails: TokenDetails = reduce(
    tokenDetailsResult,
    (acc, field, index: number) => {
      return {
        ...acc,
        [tokenFields[index]]: field.result,
      };
    },
    { symbol: undefined, name: undefined, decimals: undefined },
  );
  const stakeBalanceDisplay = stakeBalance?.amount
    ? formatUnits(stakeBalance?.amount, tokenDetails?.decimals || 18)
    : '0';

  return Promise.resolve({
    tokenDetails,
    stakeBalance,
    stakeBalanceDisplay,
  });
};

const useStakingDetails = ({
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
}: {
  moduleDetails: ModuleDetails | undefined;
  moduleParameters: ModuleParameter[] | undefined;
  chainId: number | undefined;
  wearer: Hex | undefined;
}) => {
  const tokenAddressParam = find(moduleParameters, { label: 'Staking Token' });
  return useQuery({
    queryKey: [
      'stakingDetails',
      {
        moduleDetails,
        tokenAddress: tokenAddressParam?.value,
        chainId,
        wearer,
      },
    ],
    queryFn: () =>
      fetchStakingDetails({
        moduleDetails,
        tokenAddress: tokenAddressParam?.value as Hex,
        chainId,
        wearer,
      }),
    staleTime: Infinity,
    enabled:
      !!moduleDetails &&
      !!moduleParameters &&
      !!tokenAddressParam?.value &&
      !!chainId,
  });
};

export default useStakingDetails;

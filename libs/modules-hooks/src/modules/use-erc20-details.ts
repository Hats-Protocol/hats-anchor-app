import { useQuery } from '@tanstack/react-query';
import { compact, concat, map } from 'lodash';
import { viemPublicClient } from 'utils';
import { erc20Abi, formatUnits, Hex } from 'viem';

const fetchErc20Details = async ({
  contractAddress,
  wearerAddress,
  chainId,
}: {
  contractAddress: Hex | undefined;
  wearerAddress: Hex | undefined;
  chainId: number | undefined;
}) => {
  if (!chainId || !wearerAddress || !contractAddress) return Promise.resolve(null);
  const tokenFields = ['symbol', 'name', 'decimals'];
  const tokenFieldContracts = map(tokenFields, (field) => ({
    address: contractAddress,
    abi: erc20Abi,
    functionName: field,
  }));

  const balanceOfWearer = {
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [wearerAddress],
  };

  const result = await viemPublicClient(chainId).multicall({
    contracts: compact(concat(tokenFieldContracts, balanceOfWearer)),
  });
  const [symbol, name, decimals, userBalance] = map(result, 'result') as [string, string, number, bigint];

  const userBalanceDisplay = formatUnits(userBalance || BigInt(0), decimals || 18);

  return {
    tokenDetails: { symbol, name, decimals },
    userBalance,
    userBalanceDisplay,
  };
};

const useErc20Details = ({ contractAddress, wearerAddress, chainId }: UseErc20DetailsProps) => {
  return useQuery({
    queryKey: ['erc20Details', { contractAddress, wearerAddress, chainId }],
    queryFn: () => fetchErc20Details({ contractAddress, wearerAddress, chainId }),
    enabled: !!contractAddress && !!chainId,
  });
};

interface UseErc20DetailsProps {
  contractAddress: Hex | undefined;
  wearerAddress: Hex | undefined;
  chainId: number | undefined;
}

export { useErc20Details };

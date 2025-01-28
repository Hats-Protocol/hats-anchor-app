import { ERC1155_ABI } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import { compact, map } from 'lodash';
import { viemPublicClient } from 'utils';
import { Hex } from 'viem';

const bundleFetchErc1155Details = async ({
  contractAddress,
  wearerAddress,
  tokenId,
  chainId,
}: {
  contractAddress: Hex | undefined;
  wearerAddress: Hex | undefined;
  tokenId: bigint | Hex | undefined;
  chainId: number | undefined;
}) => {
  if (!contractAddress || !chainId) return Promise.resolve(null);
  const contracts = compact([
    {
      address: contractAddress,
      abi: ERC1155_ABI,
      functionName: 'uri',
      args: [tokenId],
    },
    wearerAddress && {
      address: contractAddress,
      abi: ERC1155_ABI,
      functionName: 'balanceOf',
      args: [wearerAddress, tokenId],
    },
  ]) as any[];
  const data = await viemPublicClient(chainId).multicall({
    contracts,
  });

  const [, userBalance] = map(data, 'result') as [object, bigint | undefined];

  const userBalanceDisplay = userBalance?.toString() || '0';

  return Promise.resolve({ userBalance, userBalanceDisplay });
};

const useErc1155Details = ({
  contractAddress,
  wearerAddress,
  tokenId,
  chainId,
}: {
  contractAddress: Hex;
  wearerAddress: Hex | undefined;
  tokenId: bigint | Hex | undefined;
  chainId: number | undefined;
}) => {
  const stringifiedTokenId = tokenId?.toString();
  const { data, error } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['erc1155Details', { contractAddress, wearerAddress, stringifiedTokenId, chainId }],
    queryFn: () =>
      bundleFetchErc1155Details({
        contractAddress,
        wearerAddress,
        tokenId,
        chainId,
      }),
    enabled: !!contractAddress && !!tokenId && !!chainId,
  });

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};

export { useErc1155Details };

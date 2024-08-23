import { useQuery } from '@tanstack/react-query';
import { fetch1155BalanceWithId, fetchErc1155Details } from 'utils';
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
  const promises: Promise<unknown>[] = [
    fetchErc1155Details({
      address: contractAddress,
      tokenId,
      chainId,
    }),
  ];
  if (wearerAddress) {
    promises.push(
      fetch1155BalanceWithId({
        address: wearerAddress,
        token: contractAddress,
        tokenId,
        chainId,
      }),
    );
  }
  const data = await Promise.all(promises);
  const [, userBalance] = data as [object, bigint | undefined];

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
    queryKey: [
      'erc1155Details',
      { contractAddress, wearerAddress, stringifiedTokenId, chainId },
    ],
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

export default useErc1155Details;

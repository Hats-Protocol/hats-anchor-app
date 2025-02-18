import { useQuery } from '@tanstack/react-query';
import { fetch721Balance, fetch721Metadata, Fetch721MetadataResult } from 'utils';
import { Hex } from 'viem';

const fetchErc721Details = async ({ contractAddress, wearerAddress, chainId }: UseErc721DetailsProps) => {
  const promises: Promise<unknown>[] = [
    fetch721Metadata({
      address: contractAddress,
      chainId,
    }),
  ];
  if (wearerAddress) {
    promises.push(
      fetch721Balance({
        address: wearerAddress,
        token: contractAddress,
        chainId,
      }),
    );
  }
  const data = await Promise.all(promises);
  const [tokenDetails, userBalance] = data as [Fetch721MetadataResult, bigint | undefined];

  const userBalanceDisplay = userBalance?.toString() || '0';

  return {
    tokenDetails,
    userBalance,
    userBalanceDisplay,
  };
};

const useErc721Details = ({ contractAddress, wearerAddress, chainId }: UseErc721DetailsProps) => {
  return useQuery({
    queryKey: ['erc721Details', { contractAddress, wearerAddress, chainId }],
    queryFn: () => fetchErc721Details({ contractAddress, wearerAddress, chainId }),
    enabled: !!contractAddress && !!chainId,
  });
};

interface UseErc721DetailsProps {
  contractAddress: Hex | undefined;
  wearerAddress: Hex | undefined;
  chainId: number | undefined;
}

export { useErc721Details };

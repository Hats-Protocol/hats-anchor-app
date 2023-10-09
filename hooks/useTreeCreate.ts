import { useQueryClient } from '@tanstack/react-query';
import router from 'next/router';
import { isAddress, TransactionReceipt } from 'viem';
import { useAccount, useChainId, useEnsAddress } from 'wagmi';

import useHatContractWrite from '@/hooks/useHatContractWrite';
import { treeCreateEventIdToTreeId } from '@/lib/hats';

const useTreeCreate = ({
  chainId,
  details,
  receiver,
  overrideReceiver,
  imageUrl,
}: UseTreeCreateProps) => {
  const { address } = useAccount();
  const currentNetworkId = useChainId();
  const queryClient = useQueryClient();

  const {
    data: newReceiverResolvedAddress,
    isLoading: isLoadingNewReceiverResolvedAddress,
  } = useEnsAddress({
    name: receiver,
    chainId: 1,
  });

  function handleSuccess(transactionData?: TransactionReceipt) {
    if (!transactionData) return;
    const data = transactionData?.logs[0]?.data;
    const treeId = treeCreateEventIdToTreeId(data);
    if (!treeId) return;

    setTimeout(() => {
      queryClient.invalidateQueries(['treeList', chainId]);
      queryClient.invalidateQueries(['wearerDetails']);
    }, 1000);

    router.push(`/trees/${chainId}/${treeId}`);
  }

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'mintTopHat',
    args: [
      overrideReceiver ? newReceiverResolvedAddress ?? receiver : address,
      details || '',
      imageUrl || '',
    ],
    chainId,
    onSuccessToastData: {
      title: 'Tree created!',
      description: 'Successfully created tree',
    },
    queryKeys: [['treeList', chainId]],
    enabled:
      isAddress(
        overrideReceiver
          ? newReceiverResolvedAddress ?? receiver
          : address || '',
      ) && chainId === currentNetworkId,
    handleSuccess,
  });

  return {
    writeAsync,
    isLoading: isLoading || isLoadingNewReceiverResolvedAddress,
  };
};

export default useTreeCreate;

interface UseTreeCreateProps {
  chainId: number;
  details?: string;
  receiver: string;
  overrideReceiver: boolean;
  imageUrl?: string;
}

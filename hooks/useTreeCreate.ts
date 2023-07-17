import router from 'next/router';
import { isAddress } from 'viem';
import { useAccount, useEnsAddress } from 'wagmi';

import { treeCreateEventIdToTreeId } from '@/lib/hats';

import useHatContractWrite from './useHatContractWrite';

const useTreeCreate = ({
  chainId,
  details,
  receiver,
  overrideReceiver,
  imageUrl,
}: UseTreeCreateProps) => {
  const { address } = useAccount();
  const {
    data: newReceiverResolvedAddress,
    isLoading: isLoadingNewReceiverResolvedAddress,
  } = useEnsAddress({
    name: receiver,
    chainId: 1,
  });

  function handleSuccess(transactionData: any) {
    const data = transactionData?.logs[0]?.data;
    const treeId = treeCreateEventIdToTreeId(data);
    if (!treeId) return;

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
    enabled: isAddress(
      overrideReceiver ? newReceiverResolvedAddress ?? receiver : address || '',
    ),
    handleSuccess,
  });

  return {
    writeAsync,
    isLoading: isLoading || isLoadingNewReceiverResolvedAddress,
  };
};

export default useTreeCreate;

interface UseTreeCreateProps {
  hatsAddress?: `0x${string}`;
  chainId: number;
  details?: string;
  receiver: string;
  overrideReceiver: boolean;
  imageUrl?: string;
}

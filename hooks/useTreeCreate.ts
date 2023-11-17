import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import router from 'next/router';
import { isAddress, TransactionReceipt } from 'viem';
import { useAccount, useChainId, useEnsAddress } from 'wagmi';

import { fetchTreeDetails } from '@/gql/helpers';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useToast from '@/hooks/useToast';
import { decimalToTreeId, treeCreateEventIdToTreeId } from '@/lib/hats';

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
  const toast = useToast();

  const {
    data: newReceiverResolvedAddress,
    isLoading: isLoadingNewReceiverResolvedAddress,
  } = useEnsAddress({
    name: receiver,
    chainId: 1,
  });

  async function handleSuccess(transactionData?: TransactionReceipt) {
    if (!transactionData) return;
    const eventData = _.get(transactionData, 'logs[0].data');
    const treeId = treeCreateEventIdToTreeId(eventData);
    if (!treeId) return;

    // wait for tree to be created and found in the subgraph
    let treeFound = false;
    while (!treeFound) {
      // eslint-disable-next-line no-await-in-loop
      const tree = await fetchTreeDetails(
        decimalToTreeId(_.toString(treeId)),
        chainId,
      );

      setTimeout(() => {
        // eslint-disable-next-line no-console
        console.log('waiting for tree to be created');
      }, 1000);

      if (!tree) return;

      treeFound = true;

      queryClient.invalidateQueries(['treeList', chainId]);
      queryClient.invalidateQueries(['wearerDetails']);

      toast.info({
        title: 'Redirecting you to your new tree',
      });

      router.push(`/trees/${chainId}/${treeId}`);
    }
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

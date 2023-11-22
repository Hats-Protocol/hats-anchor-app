import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import router from 'next/router';
import { isAddress, TransactionReceipt } from 'viem';
import { useAccount, useChainId, useEnsAddress } from 'wagmi';

import useHatContractWrite from '@/hooks/useHatContractWrite';
import useToast from '@/hooks/useToast';
import { decimalToTreeId, treeCreateEventIdToTreeId } from '@/lib/hats';
import { fetchTreeDetails } from '@/lib/subgraph';

async function waitForTreeCreation(treeId: number, chainId: number) {
  return new Promise((resolve) => {
    const checkTree = async () => {
      try {
        const tree = await fetchTreeDetails(
          decimalToTreeId(_.toString(treeId)),
          chainId,
        );

        if (tree) {
          clearInterval(intervalId);
          resolve(tree);
        }
        // eslint-disable-next-line no-console
        console.log('waiting for tree creation');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    };

    const intervalId = setInterval(checkTree, 1000);
    checkTree(); // Check immediately

    setTimeout(() => {
      clearInterval(intervalId);
      resolve(null); // Resolve with null or handle the timeout case
    }, 20000);
  });
}

// hats-hooks
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
    await waitForTreeCreation(treeId, chainId);

    queryClient.invalidateQueries(['treeList', chainId]);
    queryClient.invalidateQueries(['wearerDetails']);

    toast.info({
      title: 'Redirecting you to your new tree',
    });

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
      description: 'Waiting on the subgraph to index your tree...', // 'Successfully created tree',
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

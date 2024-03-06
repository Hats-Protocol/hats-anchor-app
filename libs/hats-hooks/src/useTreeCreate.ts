import { treeIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { HandlePendingTx } from 'hats-types';
import { treeCreateEventIdToTreeId } from 'hats-utils';
import { useToast, useWaitForSubgraph } from 'hooks';
import _ from 'lodash';
import router from 'next/router';
import { useState } from 'react';
import { fetchTreeDetails } from 'utils';
import { isAddress, TransactionReceipt } from 'viem';
import { useAccount, useChainId, useEnsAddress } from 'wagmi';

import useHatContractWrite from './useHatContractWrite';

// hats-hooks
const useTreeCreate = ({
  chainId,
  details,
  receiver,
  overrideReceiver,
  imageUrl,
  handlePendingTx,
}: UseTreeCreateProps) => {
  const { address } = useAccount();
  const currentNetworkId = useChainId();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [treeId, setTreeId] = useState<number | null>(null);

  const {
    data: newReceiverResolvedAddress,
    isLoading: isLoadingNewReceiverResolvedAddress,
  } = useEnsAddress({
    name: receiver,
    chainId: 1,
  });

  const waitForSubgraph = useWaitForSubgraph({
    label: 'Waiting for tree creation in the subgraph',
    fetchHelper: treeId
      ? () => fetchTreeDetails(treeIdDecimalToHex(treeId), chainId)
      : () => Promise.resolve(null),
    checkResult: (tree) => !!tree,
  });

  async function handleSuccess(transactionData?: TransactionReceipt) {
    if (!transactionData) return;
    const eventData = _.get(transactionData, 'logs[0].data');
    const newTreeId = treeCreateEventIdToTreeId(eventData);
    if (!newTreeId) return;
    setTreeId(newTreeId);

    await waitForSubgraph();

    queryClient.invalidateQueries(['treeList', chainId]);
    queryClient.invalidateQueries(['wearerDetails']);
    toast.info({ title: 'Redirecting you to your new tree' });
    router.push(`/trees/${chainId}/${newTreeId}`);
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
    handlePendingTx,
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
  handlePendingTx: HandlePendingTx;
}

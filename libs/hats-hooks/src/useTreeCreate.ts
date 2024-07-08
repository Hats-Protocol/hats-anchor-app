'use client';

import { treeIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { treeCreateEventIdToTreeId } from 'hats-utils';
import { useToast, useWaitForSubgraph } from 'hooks';
import _ from 'lodash';
import posthog from 'posthog-js';
import { useState } from 'react';
import { HandlePendingTx } from 'types';
import { fetchTreeDetails, invalidateAfterTransaction } from 'utils';
import { isAddress, TransactionReceipt } from 'viem';
import { useAccount, useChainId, useEnsAddress } from 'wagmi';

import useHatContractWrite from './useHatContractWrite';

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
  const [stillLoading, setStillLoading] = useState(false);

  const {
    data: newReceiverResolvedAddress,
    isLoading: isLoadingNewReceiverResolvedAddress,
  } = useEnsAddress({
    name: receiver,
    chainId: 1,
  });

  const waitForSubgraph = useWaitForSubgraph({
    fetchHelper: treeId
      ? () => fetchTreeDetails(treeIdDecimalToHex(treeId), chainId)
      : () => Promise.resolve(null),
    checkResult: (tree) => !!tree,
  });

  async function handleSuccess(transactionData?: TransactionReceipt) {
    setStillLoading(true);
    if (!transactionData) return;
    const eventData = _.get(transactionData, 'logs[0].data');
    const newTreeId = treeCreateEventIdToTreeId(eventData);
    if (!newTreeId) return;
    setTreeId(newTreeId);
    posthog.capture('Created New Tree', { chainId, tree_id: newTreeId });

    await waitForSubgraph();
    await invalidateAfterTransaction(chainId, transactionData.transactionHash);

    queryClient.invalidateQueries({ queryKey: ['treeList', chainId] });
    queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
    setStillLoading(false);
    toast.info({ title: 'Redirecting you to your new tree' });

    window.history.pushState({}, '', `/trees/${chainId}/${newTreeId}`);
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
      // duration: 6000, // TODO did we remove this param?
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
    isLoading: isLoading || isLoadingNewReceiverResolvedAddress || stillLoading,
  };
};

export default useTreeCreate;

interface UseTreeCreateProps {
  chainId: number;
  details?: string;
  receiver: string;
  overrideReceiver: boolean;
  imageUrl?: string;
  handlePendingTx: HandlePendingTx | undefined;
}

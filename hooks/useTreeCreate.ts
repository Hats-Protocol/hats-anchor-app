import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  useAccount,
  useContractWrite,
  useEnsAddress,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import abi from '@/contracts/Hats.json';
import useToast from '@/hooks/useToast';
import { treeCreateEventIdToTreeId } from '@/lib/hats';

const useTreeCreate = ({
  hatsAddress,
  chainId,
  details,
  receiver,
  overrideReceiver,
  imageUrl,
}: UseTreeCreateProps) => {
  const { address } = useAccount();
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<`0x${string}`>();
  const router = useRouter();

  const {
    data: newReceiverResolvedAddress,
    isLoading: isLoadingNewReceiverResolvedAddress,
  } = useEnsAddress({
    name: receiver,
    chainId: 1,
  });

  const { config } = usePrepareContractWrite({
    address: hatsAddress || CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'mintTopHat',
    args: [
      overrideReceiver ? newReceiverResolvedAddress ?? receiver : address,
      details || '',
      imageUrl || '',
    ],
    enabled: !!hatsAddress,
  });

  function handleSuccess(transactionData: any) {
    const data = transactionData?.logs[0]?.data;
    const treeId = treeCreateEventIdToTreeId(data);
    if (!treeId) return;

    router.push(`/trees/${chainId}/${treeId}`);
  }

  function handleError(error: any) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  const { writeAsync } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      setHash(data.hash);

      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: 'Tree created!',
          description: `Successfully created tree`,
        },
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['treeList', chainId] });
      }, 4000);
    },
    onError: (error) => {
      if (error.name === 'UserRejectedRequestError') {
        toast.error({
          title: 'Signature rejected!',
          description: 'Please accept the transaction in your wallet',
        });
      } else {
        toast.error({
          title: 'Error occurred!',
          // description: 'Please accept the transaction in your wallet',
        });
      }
    },
  });

  const { isLoading } = useWaitForTransaction({
    hash,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  return {
    writeAsync,
    isLoading: isLoading || isLoadingNewReceiverResolvedAddress,
    receiverResolvedAddress: newReceiverResolvedAddress,
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

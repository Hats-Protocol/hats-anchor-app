import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { hatsAddresses } from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';

import { treeCreateEventIdToTreeId } from '../lib/hats';

const useTreeCreate = ({
  hatsAddress,
  chainId,
  details,
  receiver,
  overrideReceiver,
  imageUrl,
}) => {
  const { address } = useAccount();
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { config } = usePrepareContractWrite({
    address: hatsAddress || hatsAddresses(chainId),
    chainId,
    abi: JSON.stringify(abi),
    functionName: 'mintTopHat',
    args: [
      overrideReceiver ? receiver : address,
      details || '',
      imageUrl || '',
    ],
    enabled: !!hatsAddress,
  });

  function handleSuccess(transactionData) {
    const data = transactionData?.logs[0]?.data;
    const treeId = treeCreateEventIdToTreeId(data);
    if (!treeId) return;

    router.push(`/trees/${chainId}/${treeId}/${treeId}`);
  }

  function handleError(error) {
    console.error(error);
  }

  const { writeAsync, data: writeData } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
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
    hash: writeData?.hash,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  return { writeAsync, isLoading };
};

export default useTreeCreate;

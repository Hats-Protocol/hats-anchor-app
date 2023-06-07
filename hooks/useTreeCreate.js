import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import _, { set } from 'lodash';
import { useRouter } from 'next/router';
import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useWaitForTransaction,
  useEnsAddress,
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
}) => {
  const { address } = useAccount();
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isLoadingTx, setIsLoadingTx] = useState(false);

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

  const { writeAsync, data: writeData } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      setIsLoadingTx(true);

      const txResult = await handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: 'Tree created!',
          description: `Successfully created tree`,
        },
        // redirect: '',
      });
      const txData = txResult?.logs[0]?.data;
      const treeId = treeCreateEventIdToTreeId(txData);
      setIsLoadingTx(false);

      if (treeId) {
        router.push(`/trees/${chainId}/${treeId}/${treeId}`);
      }

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['treeList', treeId],
        });
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
  });

  return {
    writeAsync,
    isLoading: isLoadingTx || isLoading || isLoadingNewReceiverResolvedAddress,
    receiverResolvedAddress: newReceiverResolvedAddress,
  };
};

export default useTreeCreate;

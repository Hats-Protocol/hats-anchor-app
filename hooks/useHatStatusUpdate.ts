import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { useState } from 'react';

import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import abi from '@/contracts/Hats.json';
import useToast from '@/hooks/useToast';
import { prettyIdToId, toTreeId } from '@/lib/hats';

const useHatStatusUpdate = ({
  hatsAddress,
  hatId,
  chainId,
  status,
}: UseHatStatusUpdateProps) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<`0x${string}`>();

  const { config } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'setHatStatus',
    args: [prettyIdToId(hatId), status === 'Active'],
    enabled: Boolean(hatsAddress) && Boolean(hatId),
  });

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
          title: `Hat Status Updated!`,
          description: `Successfully updated hat`,
        },
      });

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['hatDetails', prettyIdToId(hatId)],
        });
        queryClient.invalidateQueries({
          queryKey: ['treeDetails', toTreeId(prettyIdToId(hatId))],
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
    hash,
  });

  return { writeAsync, isLoading };
};

export default useHatStatusUpdate;

interface UseHatStatusUpdateProps {
  hatsAddress: `0x${string}`;
  hatId: string;
  chainId: number;
  status: string;
}

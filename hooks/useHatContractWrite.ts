import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import abi from '@/contracts/Hats.json';
import useToast from '@/hooks/useToast';

interface ContractInteractionProps {
  functionName: string;
  args: any[];
  chainId: number;
  onSuccessToastData: { title: string; description?: string };
  onErrorToastData?: { title: string; description?: string };
  queryKeys?: (string | number)[][];
  transactionTimeout?: number;
  enabled: boolean;
  handleSuccess?: (data: any) => void;
}

const useHatContractWrite = ({
  functionName,
  args,
  chainId,
  onSuccessToastData,
  onErrorToastData,
  queryKeys = [],
  transactionTimeout = 4000,
  enabled,
  handleSuccess,
}: ContractInteractionProps) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<`0x${string}`>();

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId: Number(chainId),
    abi,
    functionName,
    args,
    enabled,
  });

  const { writeAsync, error: writeError } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      setHash(data.hash);
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx({
        hash: data.hash,
        toastData: onSuccessToastData,
      });

      setTimeout(() => {
        queryKeys.forEach((key) =>
          queryClient.invalidateQueries({
            queryKey: key,
          }),
        );
      }, transactionTimeout);
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
          description:
            onErrorToastData?.description ??
            'An error occurred while processing the transaction.',
        });
      }
    },
  });

  const { isLoading } = useWaitForTransaction({
    hash,
    onSuccess: handleSuccess,
  });

  return { writeAsync, isLoading, prepareError, writeError };
};

export default useHatContractWrite;

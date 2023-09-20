import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Hex, TransactionReceipt } from 'viem';
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
  args: unknown[];
  chainId?: number;
  onSuccessToastData?: { title: string; description?: string };
  onErrorToastData?: { title: string; description?: string };
  queryKeys?: (object | string | number)[][];
  transactionTimeout?: number;
  enabled: boolean;
  handleSuccess?: (data: TransactionReceipt) => void;
}

const useHatContractWrite = ({
  functionName,
  args,
  chainId,
  onSuccessToastData,
  onErrorToastData,
  queryKeys = [],
  transactionTimeout = 500,
  enabled,
  handleSuccess,
}: ContractInteractionProps) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<Hex>();

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId: Number(chainId),
    abi,
    functionName,
    args,
    enabled: enabled && !!chainId,
  });

  const { writeAsync, error: writeError } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      setHash(data.hash);
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx?.({
        hash: data.hash,
        toastData: onSuccessToastData,
      });
    },
    onError: (error) => {
      if (
        error.name === 'TransactionExecutionError' &&
        error.message.includes('User rejected the request')
      ) {
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
    onSuccess: (data) => {
      handleSuccess?.(data);
      setTimeout(() => {
        queryKeys.forEach((key) =>
          queryClient.invalidateQueries({
            queryKey: key,
          }),
        );
      }, transactionTimeout);
    },
  });

  return { writeAsync, isLoading, prepareError, writeError };
};

export default useHatContractWrite;

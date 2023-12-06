import { useQueryClient } from '@tanstack/react-query';
import { CONFIG } from 'app-constants';
import { useToast } from 'app-hooks';
import { formatFunctionName } from 'app-utils';
import { HandlePendingTx } from 'hats-types';
import { useState } from 'react';
import { TransactionReceipt } from 'viem';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';

interface ContractInteractionProps {
  functionName: string;
  args: unknown[];
  chainId?: number;
  onSuccessToastData?: { title: string; description?: string };
  onErrorToastData?: { title: string; description?: string };
  queryKeys?: (object | string | number)[][];
  transactionTimeout?: number;
  enabled: boolean;
  handlePendingTx?: HandlePendingTx;
  handleSuccess?: (data?: TransactionReceipt) => void;
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
  handlePendingTx,
  handleSuccess,
}: ContractInteractionProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId: Number(chainId),
    abi: CONFIG.hatsAbi,
    functionName,
    args,
    enabled: enabled && !!chainId,
  });

  const {
    writeAsync,
    error: writeError,
    isLoading: writeLoading,
  } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      setIsLoading(true);
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx?.({
        hash: data.hash,
        txChainId: chainId,
        fnName: formatFunctionName(functionName),
        toastData: onSuccessToastData,
        onSuccess: (d?: TransactionReceipt) => {
          handleSuccess?.(d);
          setTimeout(() => {
            queryKeys.forEach((key) =>
              queryClient.invalidateQueries({
                queryKey: key,
              }),
            );
          }, transactionTimeout);
        },
      });
      setIsLoading(false);
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

  return {
    writeAsync,
    isLoading: isLoading || writeLoading,
    prepareError,
    writeError,
  };
};

export default useHatContractWrite;

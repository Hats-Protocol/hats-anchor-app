import { CONFIG } from '@hatsprotocol/constants';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from 'app-hooks';
import { formatFunctionName } from 'app-utils';
import { HandlePendingTx } from 'hats-types';
import { useState } from 'react';
import { TransactionReceipt } from 'viem';
import { useChainId, useContractWrite, usePrepareContractWrite } from 'wagmi';

interface ContractInteractionProps {
  functionName: string;
  args: unknown[];
  chainId?: number;
  onSuccessToastData?: { title: string; description?: string };
  txDescription?: string;
  onErrorToastData?: { title: string; description?: string };
  queryKeys?: (object | string | number)[][];
  transactionTimeout?: number;
  enabled: boolean;
  handlePendingTx?: HandlePendingTx; // pass both handlePendingTx and handleSuccess to useHatContractWrite
  handleSuccess?: (data?: TransactionReceipt) => void; // passed with handlePendingTx
}

const useHatContractWrite = ({
  functionName,
  args,
  chainId,
  onSuccessToastData,
  txDescription,
  onErrorToastData,
  queryKeys = [],
  transactionTimeout = 500,
  enabled,
  handlePendingTx,
  handleSuccess,
}: ContractInteractionProps) => {
  const toast = useToast();
  const userChainId = useChainId();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId: Number(chainId),
    abi: CONFIG.hatsAbi,
    functionName,
    args,
    enabled: enabled && !!chainId && userChainId === chainId,
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
        txDescription: txDescription || formatFunctionName(functionName),
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

  const extractErrorMessage = (error: Error | null) => {
    if (!error) return '';

    let errorMessage = error.message || '';
    const errorMatch = errorMessage.match(/Error:\s*(.*)/);
    const [, errorMessageMatch] = errorMatch || [];
    errorMessage = errorMessageMatch || errorMessage;
    errorMessage = errorMessage.replace(/\(.*\)/, '').trim();

    return errorMessage || 'An unknown error occurred';
  };

  return {
    writeAsync,
    isLoading: isLoading || writeLoading,
    prepareError,
    prepareErrorMessage: extractErrorMessage(prepareError),
    writeError,
  };
};

export default useHatContractWrite;

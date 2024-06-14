import { CONFIG } from '@hatsprotocol/constants';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from 'hooks';
import { useState } from 'react';
import { HandlePendingTx, ToastProps } from 'types';
import { formatFunctionName } from 'utils';
import { TransactionReceipt } from 'viem';
import { useChainId, useWriteContract } from 'wagmi';

interface ContractInteractionProps {
  functionName: string;
  args: unknown[];
  chainId?: number;
  waitForSubgraphToastData?: ToastProps;
  onSuccessToastData?: ToastProps;
  txDescription?: string;
  onErrorToastData?: ToastProps;
  queryKeys?: (object | string | number)[][];
  transactionTimeout?: number;
  enabled: boolean;
  handlePendingTx?: HandlePendingTx; // pass both handlePendingTx and handleSuccess to useHatContractWrite
  handleSuccess?: (data?: TransactionReceipt) => void; // passed with handlePendingTx
  waitForSubgraph?: (data?: TransactionReceipt) => Promise<unknown>; // passed with handleSuccess
}

const useHatContractWrite = ({
  functionName,
  args,
  chainId,
  waitForSubgraphToastData,
  onSuccessToastData,
  txDescription,
  onErrorToastData,
  queryKeys = [],
  transactionTimeout = 500,
  enabled,
  handlePendingTx,
  handleSuccess,
  waitForSubgraph,
}: ContractInteractionProps) => {
  const toast = useToast();
  const userChainId = useChainId();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const handleHatWrite = async () => {
    if (!enabled || !chainId || userChainId !== chainId) return null;

    return writeContractAsync({
      address: CONFIG.hatsAddress,
      chainId: Number(chainId),
      abi: CONFIG.hatsAbi,
      functionName,
      args,
    })
      .then((hash) => {
        setIsLoading(true);
        toast.info({
          title: 'Transaction submitted',
          description: 'Waiting for your transaction to be accepted...',
          duration: 4000,
        });

        handlePendingTx?.({
          hash,
          txChainId: chainId,
          txDescription: txDescription || formatFunctionName(functionName),
          toastData: waitForSubgraphToastData,
          onSuccess: async (d?: TransactionReceipt) => {
            handleSuccess?.(d);

            await waitForSubgraph?.(d);

            if (onSuccessToastData) {
              toast[onSuccessToastData.status || 'success']({
                ...onSuccessToastData,
                title: onSuccessToastData.title ?? 'Transaction successful',
              });
            }

            // we can remove the timeout after we add waitForSubgraph everywhere
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
      })
      .catch((error) => {
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
            title: 'Transaction failed',
            description: 'Please try again later',
          });
        }
      });
  };

  return {
    writeAsync: handleHatWrite,
    isLoading,
  };
};

export default useHatContractWrite;

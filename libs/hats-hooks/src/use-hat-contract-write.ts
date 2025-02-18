import { HATS_ABI, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from 'hooks';
import { useState } from 'react';
import { AsyncTxHandler, HandlePendingTx, SyncTxHandler, ToastProps } from 'types';
import { formatFunctionName } from 'utils';
import { TransactionReceipt } from 'viem';
import { useChainId, useWriteContract } from 'wagmi';

interface ContractInteractionProps {
  functionName: string;
  args: unknown[];
  chainId: number | undefined;
  txDescription?: string;
  // Transaction handling
  handlePendingTx: HandlePendingTx | undefined; // pass both handlePendingTx and onSuccess to useHatContractWrite
  waitForSubgraph: AsyncTxHandler; // passed with handlePendingTx
  handleSuccess?: SyncTxHandler; // passed with handlePendingTx   // TODO rename onSuccess
  // Toasts
  waitForTxToastData?: ToastProps;
  waitForSubgraphToastData?: ToastProps;
  successToastData?: ToastProps;
  errorToastData?: ToastProps;
  // After transaction clean up
  queryKeys?: (object | string | number)[][]; // invalidate these query keys after transaction is successful
  redirect?: string | null; // redirect to this URL after transaction is successful
}

/**
 * @param functionName - Name of the function to call on the contract
 * @param args - Arguments to passed to the function
 * @param chainId - Chain ID to use for the transaction
 * @param txDescription - Description of the transaction
 * @param handlePendingTx - Function to handle the pending transaction
 * @param waitForSubgraph - Function to wait for the subgraph to index the transaction
 * @param handleSuccess - Function to handle the success of the transaction
 * @param waitForTxToastData - Content of the toast displayed while waiting for the transaction to be accepted
 * @param waitForSubgraphToastData - Content of the toast displayed while waiting for the subgraph to index the transaction
 * @param successToastData - Content of the toast displayed when the transaction is successful
 * @param errorToastData - Content of the toast displayed when the transaction fails
 * @param queryKeys - The keys to invalidate in the query client
 * @param redirect - The URL to redirect to after the transaction is successful.
 */
const useHatContractWrite = ({
  functionName,
  args,
  chainId,
  txDescription,
  // Transaction handling
  handlePendingTx,
  waitForSubgraph,
  handleSuccess,
  // Toasts
  waitForTxToastData,
  waitForSubgraphToastData,
  successToastData,
  errorToastData,
  // After transaction clean up
  queryKeys = [],
  redirect,
}: ContractInteractionProps) => {
  const { toast } = useToast();
  const userChainId = useChainId();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const handleHatWrite = async () => {
    if (!chainId || userChainId !== chainId) return null;

    return writeContractAsync({
      address: HATS_V1,
      chainId: Number(chainId),
      abi: HATS_ABI,
      functionName: functionName as any,
      args: args as any,
    })
      .then((hash) => {
        setIsLoading(true);

        toast({
          title: 'Transaction submitted',
          description: 'Waiting for your transaction to be accepted...',
          duration: 5000,
          ...waitForTxToastData,
        });

        handlePendingTx?.({
          hash,
          txChainId: chainId,
          txDescription: txDescription || formatFunctionName(functionName),
          successToastData,
          waitForSubgraphToastData,
          waitForSubgraph,
          redirect,
          onSuccess: async (d?: TransactionReceipt) => {
            console.log('onSuccess', { d });
            handleSuccess?.(d);

            setTimeout(() => {
              queryKeys.forEach((key) =>
                queryClient.invalidateQueries({
                  queryKey: key,
                }),
              );
              setIsLoading(false);
            }, 500);
          },
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error);
        if (
          (error.name === 'TransactionExecutionError' || error.name === 'ContractFunctionExecutionError') &&
          error.message.includes('User rejected the request')
        ) {
          toast({
            title: 'Signature rejected!',
            description: 'Please accept the transaction in your wallet',
            variant: 'destructive',
            ...errorToastData,
          });
        } else {
          toast({
            title: 'Transaction failed',
            description: 'Please try again later',
            variant: 'destructive',
            ...errorToastData,
          });
        }
      });
  };

  return {
    writeAsync: handleHatWrite,
    isLoading,
  };
};

export { useHatContractWrite };

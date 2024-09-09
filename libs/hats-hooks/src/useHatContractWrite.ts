'use client';

import { CONFIG } from '@hatsprotocol/constants';
import { HATS_ABI } from '@hatsprotocol/sdk-v1-core';
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
  chainId: number | undefined;
  txDescription?: string;
  // Transaction handling
  handlePendingTx: HandlePendingTx | undefined; // pass both handlePendingTx and handleSuccess to useHatContractWrite
  waitForSubgraph: ((data?: TransactionReceipt) => Promise<unknown>) | undefined; // passed with handleSuccess
  handleSuccess?: ((data?: TransactionReceipt) => void) | undefined; // passed with handlePendingTx
  // Toasts
  waitForTxToastData?: ToastProps;
  waitForSubgraphToastData?: ToastProps;
  successToastData?: ToastProps;
  errorToastData?: ToastProps;
  // After transaction clean up
  queryKeys?: (object | string | number)[][];
  redirect?: string | null;
  enabled: boolean;
}

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
  enabled,
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
      abi: HATS_ABI,
      functionName: functionName as any,
      args: args as any,
    })
      .then((hash) => {
        setIsLoading(true);
        toast.info({
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
            handleSuccess?.(d);

            queryKeys.forEach((key) =>
              queryClient.invalidateQueries({
                queryKey: key,
              }),
            );
            setIsLoading(false);
          },
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error)
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

export default useHatContractWrite;

'use client';

import { AGREEMENT_CLAIMS_HATTER_ABI } from '@hatsprotocol/constants';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { invalidateAfterTransaction } from 'utils';
import { Hex } from 'viem';
import { useWriteContract } from 'wagmi';

import useToast from './useToast';

interface ContractInteractionProps {
  functionName: string;
  address?: Hex;
  chainId?: number;
  onSuccessToastData?: {
    title: string;
    description: string;
  };
  handlePendingTx?: (data: {
    hash: Hex;
    toastData?: { title: string; description: string };
  }) => Promise<void>;
  enabled: boolean;
  onDecline?: () => void;
}

// ! DEPRECATED. TO BE REMOVED WITH HATS COMMUNITY HAT MIGRATION

// workaround for https://github.com/microsoft/TypeScript/issues/48212
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useAgreementClaimsHatterContractWrite: any = ({
  functionName,
  address,
  chainId,
  onSuccessToastData,
  handlePendingTx,
  enabled = true,
  onDecline,
}: ContractInteractionProps) => {
  const queryClient = useQueryClient();
  const localEnabled = !!address && chainId === 10 && !!functionName && enabled;

  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const handleContractWrite = async () => {
    if (!localEnabled) return null;

    return writeContractAsync({
      address: address as Hex,
      chainId: Number(chainId),
      abi: AGREEMENT_CLAIMS_HATTER_ABI,
      functionName,
    })
      .then((hash) => {
        setIsLoading(true);
        toast.info({
          title: 'Transaction submitted',
          description: 'Waiting for your transaction to be accepted...',
        });

        invalidateAfterTransaction(chainId, hash);

        queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
        queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });

        handlePendingTx?.({
          hash,
          toastData: onSuccessToastData,
        });
        setIsLoading(false);
      })

      .catch((error) => {
        console.log(error);
        if (
          // error.name === 'TransactionExecutionError' &&
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
        onDecline?.();
      });
  };

  return {
    writeAsync: handleContractWrite,
    isLoading,
  };
};

export default useAgreementClaimsHatterContractWrite;

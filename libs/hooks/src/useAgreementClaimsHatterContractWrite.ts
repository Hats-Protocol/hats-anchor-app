import { AGREEMENT_CLAIMS_HATTER_ABI } from '@hatsprotocol/constants';
import { useState } from 'react';
import { Hex } from 'viem';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';

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
}

// ! DEPRECATED. TO BE REMOVED WITH HATS COMMUNITY HAT MIGRATION WITH SEASON 3

// workaround for https://github.com/microsoft/TypeScript/issues/48212
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useAgreementClaimsHatterContractWrite: any = ({
  functionName,
  address,
  chainId,
  onSuccessToastData,
  handlePendingTx,
  enabled = true,
}: ContractInteractionProps) => {
  const localEnabled = !!address && chainId === 10 && !!functionName && enabled;

  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { config, error: prepareError } = usePrepareContractWrite({
    address,
    chainId: Number(chainId),
    abi: AGREEMENT_CLAIMS_HATTER_ABI,
    functionName,
    enabled: localEnabled,
  });

  const {
    writeAsync,
    error: writeError,
    isLoading: isWriteLoading,
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
        toastData: onSuccessToastData,
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
          title: 'Transaction failed',
          description: 'Please try again later',
        });
      }
    },
  });

  return {
    writeAsync,
    isLoading: isLoading || isWriteLoading,
    prepareError,
    writeError,
  };
};

export default useAgreementClaimsHatterContractWrite;

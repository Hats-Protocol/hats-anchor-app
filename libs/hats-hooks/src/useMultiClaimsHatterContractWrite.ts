import { getNewInstancesFromReceipt } from '@hatsprotocol/modules-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { MULTI_CLAIMS_HATTER_ABI } from 'app-constants';
import { useToast } from 'app-hooks';
import { HandlePendingTx } from 'hats-types';
import _ from 'lodash';
import { useState } from 'react';
import { Hex } from 'viem';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { waitForTransaction } from 'wagmi/actions';

interface ContractInteractionProps {
  functionName: string;
  address?: Hex;
  chainId?: number;
  enabled: boolean;
  args: (string | number | bigint | undefined)[];
  handlePendingTx?: HandlePendingTx;
  hatId?: Hex;
}

const useMultiClaimsHatterContractWrite = ({
  functionName,
  chainId,
  enabled,
  address,
  args,
  handlePendingTx,
  hatId,
}: ContractInteractionProps) => {
  const [isLoadingMultiClaimsHatter, setIsLoadingMultiClaimsHatter] =
    useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  // TODO fetch abi from modules sdk

  const { config, error: prepareError } = usePrepareContractWrite({
    address,
    chainId: Number(chainId),
    abi: MULTI_CLAIMS_HATTER_ABI,
    functionName,
    args,
    enabled:
      enabled &&
      !!address &&
      !!chainId &&
      !!functionName &&
      // module creation args could be optional in some cases
      (!_.isEmpty(args) ? !_.some(args, _.isUndefined) : true), // currently we're assuming not
  });

  const {
    writeAsync,
    error: writeError,
    isLoading,
  } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx?.({
        hash: data.hash,
        txChainId: chainId,
        txDescription: functionName,
        toastData: {
          title: 'Transaction successful',
          description: 'Your transaction has been confirmed.',
        },
      });

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['hatDetails', { id: hatId, chainId }],
        });
      }, 1000);
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
          description: 'An error occurred while processing the transaction.',
        });
      }
    },
  });

  const deploy = async () => {
    if (!address) {
      return { newInstances: null };
    }

    setIsLoadingMultiClaimsHatter(true);
    try {
      const result = await writeAsync?.();

      if (!result) {
        setIsLoadingMultiClaimsHatter(false);
        throw new Error('No result');
      }

      const transactionReceipt = await waitForTransaction({
        hash: result?.hash,
      });
      const newInstances = getNewInstancesFromReceipt(transactionReceipt);

      setIsLoadingMultiClaimsHatter(false);
      return {
        newInstances,
      };
    } catch (error) {
      setIsLoadingMultiClaimsHatter(false);
      throw error;
    }
  };

  return {
    writeAsync,
    deploy,
    isLoading: isLoading || isLoadingMultiClaimsHatter,
    prepareError,
    writeError,
  };
};

export default useMultiClaimsHatterContractWrite;

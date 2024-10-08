import { CONFIG } from '@hatsprotocol/constants';
import { getNewInstancesFromReceipt } from '@hatsprotocol/modules-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from 'hooks';
import _ from 'lodash';
import { useState } from 'react';
import { HandlePendingTx, SupportedChains } from 'types';
import { invalidateAfterTransaction, viemPublicClient } from 'utils';
import { Hex, TransactionReceipt } from 'viem';
import { useChainId, useWriteContract } from 'wagmi';

import useHatsModules from './useHatsModules';

interface ContractInteractionProps {
  functionName: string;
  address?: Hex;
  chainId?: SupportedChains;
  enabled: boolean;
  args: (string | number | bigint | undefined)[];
  handlePendingTx?: HandlePendingTx | undefined;
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
  const userChainId = useChainId();
  const queryClient = useQueryClient();

  const { modules } = useHatsModules({ chainId });
  const mch = _.find(modules, { name: CONFIG.modules.claimsHatter });

  const { writeContractAsync } = useWriteContract();

  const writeAsync = async () => {
    if (
      !address ||
      !chainId ||
      !mch?.abi ||
      chainId !== userChainId ||
      !functionName
    ) {
      return null;
    }

    // enabled:
    // enabled &&
    // !!address &&
    // !!chainId &&
    // chainId === userChainId &&
    // !!mch?.abi &&
    // !!functionName &&
    // // module creation args could be optional in some cases
    // (!_.isEmpty(args) ? !_.some(args, _.isUndefined) : true), // currently we're assuming not

    return writeContractAsync({
      address,
      chainId: Number(chainId),
      abi: mch?.abi,
      functionName,
      args,
    })
      .then((hash) => {
        toast.info({
          title: 'Transaction submitted',
          description: 'Waiting for your transaction to be accepted...',
        });

        handlePendingTx?.({
          hash,
          txChainId: chainId,
          txDescription: functionName,
          successToastData: {
            title: 'Transaction successful',
            description: 'Your transaction has been confirmed.',
          },
          onSuccess: async (d: TransactionReceipt | undefined) => {
            if (d !== undefined) {
              await invalidateAfterTransaction(chainId, d?.transactionHash);
            }
          },
        });

        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['hatDetails', { id: hatId, chainId }],
          });
        }, 1000);
        return hash;
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
            title: 'Error occurred!',
            description: 'An error occurred while processing the transaction.',
          });
        }
      });
  };

  const deploy = async () => {
    if (!address || !chainId) {
      return { newInstances: null };
    }

    setIsLoadingMultiClaimsHatter(true);
    try {
      const result = await writeAsync?.();

      if (!result) {
        setIsLoadingMultiClaimsHatter(false);
        throw new Error('No result');
      }

      const transactionReceipt = await viemPublicClient(
        chainId,
      ).waitForTransactionReceipt({
        hash: result,
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
    isLoading: isLoadingMultiClaimsHatter,
  };
};

export default useMultiClaimsHatterContractWrite;

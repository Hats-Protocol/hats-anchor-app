import { getNewInstancesFromReceipt } from '@hatsprotocol/modules-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { CONFIG } from '@hatsprotocol/config';
import { useToast, useWaitForSubgraph } from 'hooks';
import _, { first, get } from 'lodash';
import { useState } from 'react';
import { HandlePendingTx, SupportedChains } from 'types';
import { invalidateAfterTransaction } from 'utils';
import { Hex, TransactionReceipt } from 'viem';
import { useChainId, useWriteContract } from 'wagmi';

import { useHatsModules } from './use-hats-modules';

interface ContractInteractionProps {
  functionName: string;
  address?: Hex;
  chainId?: SupportedChains;
  enabled: boolean;
  args: (string | number | bigint | undefined)[];
  handlePendingTx: HandlePendingTx | undefined;
  hatId?: Hex;
  afterSuccess?: (newInstance: Hex | null) => void;
}

const useMultiClaimsHatterContractWrite = ({
  functionName,
  chainId,
  enabled,
  address,
  args,
  handlePendingTx,
  afterSuccess,
  hatId,
}: ContractInteractionProps) => {
  const [isLoadingMultiClaimsHatter, setIsLoadingMultiClaimsHatter] = useState(false);
  const toast = useToast();
  const userChainId = useChainId();
  const queryClient = useQueryClient();
  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const { modules } = useHatsModules({ chainId });
  const mch = _.find(modules, { name: CONFIG.modules.claimsHatter });

  const { writeContractAsync } = useWriteContract();

  const onSuccess = async (receipt: TransactionReceipt | undefined) => {
    const transactionHash = get(receipt, 'transactionHash');
    if (transactionHash && !!chainId) {
      await invalidateAfterTransaction(chainId, transactionHash);
    }
    let newInstances: Hex[] = [];
    if (receipt) {
      newInstances = getNewInstancesFromReceipt(receipt);
    }

    const newInstance = first(newInstances);
    if (newInstance) {
      afterSuccess?.(newInstance);
    }

    setIsLoadingMultiClaimsHatter(false);

    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
      queryClient.invalidateQueries({ queryKey: ['treeDetails'] });
      queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
    }, 1000);
  };

  const writeAsync = async () => {
    setIsLoadingMultiClaimsHatter(true);
    if (!address || !chainId || !mch?.abi || chainId !== userChainId || !functionName) {
      return;
    }

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
          waitForSubgraph,
          onSuccess: onSuccess,
        });
      })
      .catch((error) => {
        if (
          (error.name === 'TransactionExecutionError' || error.name === 'ContractFunctionExecutionError') &&
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
        setIsLoadingMultiClaimsHatter(false);
      });
  };

  return {
    writeAsync,
    isLoading: isLoadingMultiClaimsHatter,
  };
};

export { useMultiClaimsHatterContractWrite };

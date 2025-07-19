import { CONFIG } from '@hatsprotocol/config';
import { getNewInstancesFromReceipt } from '@hatsprotocol/modules-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { useToast, useWaitForSubgraph } from 'hooks';
import { find, first, get } from 'lodash';
import { useState } from 'react';
import { HandlePendingTx, SupportedChains } from 'types';
import { invalidateAfterTransaction } from 'utils';
import { Abi, Hex, TransactionReceipt } from 'viem';
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
  mchV2?: boolean;
}

const useMultiClaimsHatterContractWrite = ({
  functionName,
  chainId,
  // enabled,
  address,
  args,
  handlePendingTx,
  afterSuccess,
  mchV2 = false,
}: ContractInteractionProps) => {
  const [isLoadingMultiClaimsHatter, setIsLoadingMultiClaimsHatter] = useState(false);
  const { toast } = useToast();
  const userChainId = useChainId();
  const queryClient = useQueryClient();
  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const { modules } = useHatsModules({ chainId, allModules: true });
  const mchV1 = find(modules, { implementationAddress: CONFIG.modules.claimsHatterV1 });
  const mchV2Module = find(modules, { implementationAddress: CONFIG.modules.claimsHatterV2 });
  const { writeContractAsync } = useWriteContract();

  const onSuccess = async (receipt: TransactionReceipt | undefined) => {
    const transactionHash = get(receipt, 'transactionHash');
    if (transactionHash && !!chainId) {
      await invalidateAfterTransaction(chainId, transactionHash);
    }
    let newInstances: Hex[] = [];
    if (receipt) {
      newInstances = getNewInstancesFromReceipt(receipt) as Hex[];
    }

    const newInstance = first(newInstances);
    if (newInstance) {
      afterSuccess?.(newInstance as Hex);
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
    if (!address || !chainId || (!mchV1?.abi && !mchV2Module?.abi) || chainId !== userChainId || !functionName) {
      return;
    }

    return writeContractAsync({
      address,
      chainId: Number(chainId),
      abi: (mchV2 ? mchV2Module?.abi : mchV1?.abi) as Abi,
      functionName,
      args,
    })
      .then((hash) => {
        toast({
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
          toast({
            title: 'Signature rejected!',
            description: 'Please accept the transaction in your wallet',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error occurred!',
            description: 'An error occurred while processing the transaction.',
            variant: 'destructive',
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

import { STATUS } from '@hatsprotocol/constants';
import { hatIdHexToDecimal, HATS_ABI, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { useToast, useWaitForSubgraph } from 'hooks';
import { first, get, size, slice } from 'lodash';
import { useEffect, useState } from 'react';
import { idToIp } from 'shared';
import { AppHat, HandlePendingTx } from 'types';
import { checkAddressIsContract, invalidateAfterTransaction } from 'utils';
import { Hex, TransactionReceipt } from 'viem';
import { useChainId, useWriteContract } from 'wagmi';

// TODO should wrap useHatContractWrite

const useHatStatusCheck = ({ hatData, chainId, handlePendingTx }: UseHatStatusCheckProps) => {
  const { toast } = useToast();
  const currentNetworkId = useChainId();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toggleIsContract, setToggleIsContract] = useState(false);
  const [testingToggle, setTestingToggle] = useState(false);
  const hatDecimalId = get(hatData, 'id') && hatIdHexToDecimal(get(hatData, 'id') as string);

  useEffect(() => {
    const testToggle = async () => {
      setTestingToggle(true);
      const localData = await checkAddressIsContract(hatData?.toggle as Hex, chainId);
      setToggleIsContract(localData);
      setTestingToggle(false);
    };
    testToggle();
  }, [hatData, chainId]);

  const { writeContractAsync } = useWriteContract();
  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const txDescription = `Check Hat Status for ${idToIp(get(hatData, 'id'))}`;
  const hatStatus = hatData?.status ? STATUS.ACTIVE : STATUS.INACTIVE;

  const onSuccess = async (d?: TransactionReceipt) => {
    const logs = get(d, 'logs');
    if (logs?.length === 0) {
      toast({
        title: txDescription,
        description: `No change: Hat Status remains ${hatStatus}`,
      });
    } else {
      const logData = first(logs)?.data;
      const newHatStatus = first(slice(logData, -1, size(logData))) === '1' ? STATUS.ACTIVE : STATUS.INACTIVE;

      toast({
        title: txDescription,
        description: `Hat Status Changed to ${newHatStatus}`,
      });
      if (chainId && d?.transactionHash) {
        await invalidateAfterTransaction(chainId, d?.transactionHash);
      }
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
        queryClient.invalidateQueries({ queryKey: ['treeDetails'] });
      }, 1000);
    }
  };

  const writeAsync = async () => {
    if (!hatDecimalId || !toggleIsContract || currentNetworkId !== chainId) return null;

    return writeContractAsync({
      address: HATS_V1,
      chainId,
      abi: HATS_ABI,
      functionName: 'checkHatStatus',
      args: [hatDecimalId],
    })
      .then((hash) => {
        setIsLoading(true);

        toast({
          title: 'Transaction submitted',
          description: 'Waiting for your transaction to be accepted...',
        });

        handlePendingTx?.({
          hash,
          txChainId: chainId,
          txDescription,
          sendSuccessToast: false,
          waitForSubgraph,
          onSuccess,
        });
        setIsLoading(false);
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
      });
  };

  return {
    writeAsync,
    isLoading: isLoading || testingToggle,
    toggleIsContract,
  };
};

interface UseHatStatusCheckProps {
  hatData?: AppHat;
  chainId?: number;
  handlePendingTx: HandlePendingTx | undefined;
}

export { useHatStatusCheck, type UseHatStatusCheckProps };

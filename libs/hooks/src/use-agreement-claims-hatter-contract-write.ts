import { AGREEMENT_CLAIMS_HATTER_ABI } from '@hatsprotocol/constants';
import { HandlePendingTx, ToastProps } from 'types';
import { Hex, TransactionReceipt } from 'viem';
import { useWriteContract } from 'wagmi';

import { useToast } from './use-toast';
import { useWaitForSubgraph } from './use-wait-for-subgraph';

interface ContractInteractionProps {
  functionName: string;
  address?: Hex;
  chainId?: number;
  successToastData?: ToastProps;
  handlePendingTx: HandlePendingTx | undefined;
  enabled: boolean;
  onDecline?: () => void;
  onSuccess: (data: TransactionReceipt | undefined) => void;
}

// ! DEPRECATED. TO BE REMOVED WITH HATS COMMUNITY HAT MIGRATION

const useAgreementClaimsHatterContractWrite = ({
  functionName,
  address,
  chainId,
  successToastData,
  handlePendingTx,
  enabled = true,
  onDecline,
  onSuccess,
}: ContractInteractionProps) => {
  const localEnabled = !!address && chainId === 10 && !!functionName && enabled;

  const { toast } = useToast();

  const { writeContractAsync } = useWriteContract();
  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const handleContractWrite = async () => {
    if (!localEnabled) return null;

    return writeContractAsync({
      address: address as Hex,
      chainId: Number(chainId),
      abi: AGREEMENT_CLAIMS_HATTER_ABI,
      functionName,
    })
      .then(async (hash) => {
        toast({
          title: 'Transaction submitted',
          description: 'Waiting for your transaction to be accepted...',
        });

        handlePendingTx?.({
          hash,
          successToastData,
          txChainId: chainId,
          txDescription: 'Signed agreement and claimed the Community Hat',
          waitForSubgraph,
          onSuccess,
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
          });
        } else {
          toast({
            title: 'Transaction failed',
            description: 'Please try again later',
          });
        }
        onDecline?.();
      });
  };

  return { writeAsync: handleContractWrite };
};

export { useAgreementClaimsHatterContractWrite };

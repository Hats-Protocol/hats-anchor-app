import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import CONFIG, { ZERO_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';
import { useOverlay } from '../contexts/OverlayContext';
import useToast from './useToast';
import { decimalId, idToPrettyId, prettyIdToIp, toTreeId } from '../lib/hats';

const useHatDetailsUpdate = ({ hatsAddress, chainId, hatId, details }) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();

  const { config } = usePrepareContractWrite({
    address: hatsAddress || CONFIG.hatsAddress,
    chainId: Number(chainId),
    abi,
    functionName: 'changeHatDetails',
    args: [
      decimalId(hatId) || ZERO_ADDRESS, // not a valid fallback? enabled handles, mostly for type
      details || '',
    ],
    enabled: !!hatsAddress && !!hatId && !!details,
  });

  const { writeAsync, data: writeData } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx({
        hash: data.hash,
        toastData: {
          title: 'Details updated!',
          description: `Successfully updated the details for hat #${prettyIdToIp(
            idToPrettyId(hatId),
          )}`,
        },
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['hatDetails', hatId] });
        queryClient.invalidateQueries({
          queryKey: ['treeDetails', toTreeId(hatId)],
        });
      }, 4000);
    },
    onError: (error) => {
      if (error.name === 'UserRejectedRequestError') {
        toast.error({
          title: 'Signature rejected!',
          description: 'Please accept the transaction in your wallet',
        });
      } else {
        toast.error({
          title: 'Error occurred!',
          // description: 'Please accept the transaction in your wallet',
        });
      }
    },
  });

  const { isLoading } = useWaitForTransaction({
    hash: writeData?.hash,
  });

  return { writeAsync, isLoading };
};

export default useHatDetailsUpdate;

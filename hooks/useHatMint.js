import {
  usePrepareContractWrite,
  useContractWrite,
  useEnsAddress,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { isAddress } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import CONFIG, { ZERO_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';
import { decimalId, toTreeId } from '../lib/hats';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';

const useHatMint = ({ hatsAddress, hatId, chainId, newWearer }) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();

  const {
    data: wearerResolvedAddress,
    isLoading: isLoadingWearerResolvedAddress,
  } = useEnsAddress({
    name: newWearer,
    chainId: 1,
  });

  const { config } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'mintHat',
    args: [
      decimalId(hatId),
      (wearerResolvedAddress ?? newWearer) || ZERO_ADDRESS,
    ],
    enabled:
      Boolean(hatsAddress) &&
      Boolean(decimalId(hatId)) &&
      Boolean(newWearer) &&
      isAddress(wearerResolvedAddress ?? newWearer),
  });

  const { writeAsync, data: writeData } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: `Hat Minted!`,
          description: `Successfully minted hat`,
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

  return {
    writeAsync,
    isLoading: isLoadingWearerResolvedAddress || isLoading,
  };
};

export default useHatMint;

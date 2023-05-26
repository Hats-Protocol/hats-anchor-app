import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { isAddress } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import CONFIG from '../constants';
import abi from '../contracts/Hats.json';
import { decimalId, toTreeId } from '../lib/hats';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';

const useBatchHatMint = ({ hatsAddress, hatId, chainId, newWearers = [] }) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();

  const { config } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'batchMintHats',
    args: [new Array(newWearers.length).fill(decimalId(hatId)), newWearers],
    enabled:
      Boolean(hatsAddress) &&
      Boolean(decimalId(hatId)) &&
      newWearers.every((wearer) => isAddress(wearer)),
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
          title: `Hats Minted!`,
          description: `Successfully minted hats`,
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
        });
      }
    },
  });

  const { isLoading } = useWaitForTransaction({
    hash: writeData?.hash,
  });

  return {
    writeAsync,
    isLoading,
  };
};

export default useBatchHatMint;

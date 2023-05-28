import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import { isAddress } from 'viem';
import CONFIG from '../constants';
import abi from '../contracts/Hats.json';
import { decimalId, toTreeId } from '../lib/hats';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';

const useHatWearerStatusCheck = ({ hatData, wearerAddress, chainId }) => {
  //
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'checkHatWearerStatus',
    args: [decimalId(_.get(hatData, 'id')), wearerAddress],
    enabled:
      Boolean(decimalId(_.get(hatData, 'id'))) &&
      Boolean(wearerAddress) &&
      isAddress(wearerAddress),
  });

  const {
    writeAsync,
    error: writeError,
    data: writeData,
  } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      const { logs } = await handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: `Hat Minted!`,
          description: `Successfully minted hat`,
        },
        sendToast: false,
      });

      console.log(logs);

      if (logs.length === 0) {
        toast.success({
          title: 'Eligibility Check Completed',
          description: `Wearer is Eligible`,
        });
      } else {
        toast.success({
          title: 'Eligibility Check Completed',
          description: `Wearer is non eligible, with ${
            logs.length === 1 ? 'Good' : 'Bad'
          } standing`,
        });

        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['hatDetails', _.get(hatData, 'id')],
          });
          queryClient.invalidateQueries({
            queryKey: ['treeDetails', toTreeId(_.get(hatData, 'id'))],
          });
        }, 4000);
      }
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

  return { writeAsync, prepareError, writeError, isLoading };
};

export default useHatWearerStatusCheck;

import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import _ from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import { hatsAddresses } from '../constants';
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
    address: hatsAddresses(chainId),
    chainId,
    abi: JSON.stringify(abi),
    functionName: 'checkHatWearerStatus',
    args: [decimalId(_.get(hatData, 'id')), wearerAddress],
    enabled: Boolean(decimalId(_.get(hatData, 'id'))) && Boolean(wearerAddress),
  });

  const { writeAsync, error: writeError } = useContractWrite({
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
        useToast: false,
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

  return { writeAsync, prepareError, writeError };
};

export default useHatWearerStatusCheck;

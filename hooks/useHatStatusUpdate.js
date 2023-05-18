import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import _ from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import CONFIG from '@/constants';
import abi from '@/contracts/Hats.json';
import { prettyIdToId, toTreeId } from '@/lib/hats';
import useToast from './useToast';
import { useOverlay } from '@/contexts/OverlayContext';

const useHatStatusUpdate = ({ hatsAddress, hatId, chainId, status }) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();

  const { config } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'setHatStatus',
    args: [prettyIdToId(hatId), status === 'Active'],
    enabled: Boolean(hatsAddress) && Boolean(hatId),
  });

  const { writeAsync } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: `Hat Status Updated!`,
          description: `Successfully updated hat`,
        },
      });

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['hatDetails', prettyIdToId(hatId)],
        });
        queryClient.invalidateQueries({
          queryKey: ['treeDetails', toTreeId(prettyIdToId(hatId))],
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

  return { writeAsync };
};

export default useHatStatusUpdate;

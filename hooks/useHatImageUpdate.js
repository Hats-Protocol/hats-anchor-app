import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import CONFIG, { ZERO_ADDRESS } from '@/constants';
import abi from '@/contracts/Hats.json';
import { useOverlay } from '@/contexts/OverlayContext';
import { idToPrettyId, prettyIdToIp, toTreeId } from '@/lib/hats';
import useToast from './useToast';

const useHatImageUpdate = ({ hatsAddress, chainId, hatId, image }) => {
  const { handlePendingTx } = useOverlay();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { config } = usePrepareContractWrite({
    address: hatsAddress || CONFIG.hatsAddress,
    chainId: _.toNumber(chainId),
    abi,
    functionName: 'changeHatImageURI',
    args: [
      hatId || ZERO_ADDRESS, // not a valid fallback? enabled handles, mostly for type
      image || '',
    ],
    enabled: !!hatsAddress && !!hatId,
  });

  const { writeAsync, data: writeData } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: 'Image updated!',
          description: `Successfully updated the image for hat #${prettyIdToIp(
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
        // track('ZoraMintError');
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

export default useHatImageUpdate;

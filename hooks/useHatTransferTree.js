import {
  usePrepareContractWrite,
  useContractWrite,
  useEnsAddress,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import { isAddress } from 'viem';
import CONFIG from '@/constants';
import abi from '@/contracts/Hats.json';
import { decimalId, prettyIdToIp, toTreeId } from '@/lib/hats';
import useToast from './useToast';
import { useOverlay } from '@/contexts/OverlayContext';

const useHatTransferTree = ({
  currentWearerAddress,
  hatData,
  newWearer,
  chainId,
}) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();

  const {
    data: newWearerResolvedAddress,
    isLoading: isLoadingNewResolvedAddress,
  } = useEnsAddress({
    name: newWearer,
    chainId: 1,
  });

  const {
    config,
    error: prepareError,
    data: writeData,
  } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'transferHat',
    args: [
      decimalId(hatData.id),
      currentWearerAddress,
      newWearerResolvedAddress ?? newWearer,
    ],
    enabled:
      Boolean(newWearerResolvedAddress ?? newWearer) &&
      Boolean(currentWearerAddress) &&
      isAddress(newWearerResolvedAddress ?? newWearer) &&
      isAddress(currentWearerAddress),
  });
  console.log('hatLinkTransferTree - prepareError', prepareError);

  const { writeAsync, error: writeError } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: `Top Hat Transferred!`,
          description: `Successfully transferred top hat #${prettyIdToIp(
            _.get(hatData, 'prettyId'),
          )} from ${currentWearerAddress} to ${newWearerResolvedAddress}`,
        },
      });

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['hatDetails', _.get(hatData, 'id')],
        });
        queryClient.invalidateQueries({
          queryKey: ['treeDetails', toTreeId(_.get(hatData, 'id'))],
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
    prepareError,
    writeError,
    isLoading: isLoadingNewResolvedAddress || isLoading,
    newWearerResolvedAddress,
  };
};

export default useHatTransferTree;

import {
  usePrepareContractWrite,
  useContractWrite,
  useEnsAddress,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import { isAddress } from 'viem';
import CONFIG from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';
import { prettyIdToId, toTreeId } from '../lib/hats';
import { useOverlay } from '../contexts/OverlayContext';

const useHatWearerStatusSet = ({
  hatsAddress,
  chainId,
  hatId,
  wearer,
  eligibility,
  standing,
}) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();

  const {
    data: wearerResolvedAddress,
    isLoading: isLoadingWearerResolvedAddress,
  } = useEnsAddress({
    name: wearer,
    chainId: 1,
  });

  const {
    config,
    error: prepareError,
    data: writeData,
  } = usePrepareContractWrite({
    address: hatsAddress || CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'setHatWearerStatus',
    args: [
      prettyIdToId(hatId), // not a valid fallback? throw instead?
      (wearerResolvedAddress ?? wearer) || '',
      eligibility === 'Eligible',
      standing === 'Good Standing',
    ],
    enabled: !!hatsAddress && isAddress(wearer),
  });
  console.log('hatWearerStatusUpdate- prepareError', prepareError);

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
          title: 'Wearer Status Updated',
          description: 'Successfully updated hat',
        },
        hatId,
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

  const { isLoading } = useWaitForTransaction({
    hash: writeData?.hash,
  });

  return {
    writeAsync,
    prepareError,
    writeError,
    isLoading: isLoadingWearerResolvedAddress || isLoading,
  };
};

export default useHatWearerStatusSet;

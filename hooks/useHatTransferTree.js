import {
  usePrepareContractWrite,
  useContractWrite,
  useEnsAddress,
} from 'wagmi';
import _ from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import { hatsAddresses } from '../constants';
import abi from '../contracts/Hats.json';
import { decimalId, prettyIdToIp, toTreeId } from '../lib/hats';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';

const useHatTransferTree = ({
  currentWearerAddress,
  hatData,
  newWearerAddress,
  chainId,
}) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();

  const {
    data: newWearerResolvedAddress,
    isError: isErrorNewResolvedAddress,
    isLoading: isLoadingNewResolvedAddress,
  } = useEnsAddress({
    name: newWearerAddress,
    chainId: 1,
  });

  const { config, error: prepareError } = usePrepareContractWrite({
    address: hatsAddresses(chainId),
    chainId,
    abi: JSON.stringify(abi),
    functionName: 'transferHat',
    args: [
      decimalId(hatData.id),
      currentWearerAddress,
      newWearerResolvedAddress,
    ],
    enabled: Boolean(newWearerResolvedAddress),
  });

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

  return {
    writeAsync,
    prepareError,
    writeError,
    ensError: isErrorNewResolvedAddress,
    isLoading: isLoadingNewResolvedAddress,
  };
};

export default useHatTransferTree;

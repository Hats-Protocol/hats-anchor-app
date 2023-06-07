import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { isAddress } from 'viem';
import {
  usePrepareContractWrite,
  useContractWrite,
  useEnsAddress,
  useWaitForTransaction,
} from 'wagmi';
import { useState } from 'react';

import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import abi from '@/contracts/Hats.json';
import useToast from '@/hooks/useToast';
import { decimalId, prettyIdToIp, toTreeId } from '@/lib/hats';

const useHatTransferTree = ({
  currentWearerAddress,
  id,
  prettyId,
  newWearer,
  chainId,
}) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState();

  const {
    data: newWearerResolvedAddress,
    isLoading: isLoadingNewResolvedAddress,
  } = useEnsAddress({
    name: newWearer,
    chainId: 1,
  });

  const newWearerAddress = newWearerResolvedAddress ?? newWearer;

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'transferHat',
    args: [decimalId(id), currentWearerAddress, newWearerAddress],
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
      setHash(data.hash);

      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: `Top Hat Transferred!`,
          description: `Successfully transferred top hat #${prettyIdToIp(
            prettyId,
          )} from ${currentWearerAddress} to ${newWearerResolvedAddress}`,
        },
      });

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['hatDetails', id],
        });
        queryClient.invalidateQueries({
          queryKey: ['treeDetails', toTreeId(id)],
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
    hash,
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

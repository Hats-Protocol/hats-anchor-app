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
import { prettyIdToId, toTreeId } from '@/lib/hats';

const useHatWearerStatusSet = ({
  hatsAddress,
  chainId,
  hatId,
  wearer,
  eligibility,
  standing,
}: UseHatWearerStatusUpdateProps) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<`0x${string}`>();

  const {
    data: wearerResolvedAddress,
    isLoading: isLoadingWearerResolvedAddress,
  } = useEnsAddress({
    name: wearer,
    chainId: 1,
  });

  const wearerAddress = (wearerResolvedAddress ?? wearer) || '';

  const { config, error: prepareError } = usePrepareContractWrite({
    address: hatsAddress || CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'setHatWearerStatus',
    args: [
      hatId, // not a valid fallback? throw instead?
      wearerAddress,
      eligibility,
      standing,
    ],
    enabled: !!hatsAddress && isAddress(wearer),
  });
  console.log('hatWearerStatusUpdate- prepareError', prepareError);

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
          title: 'Wearer Status Updated',
          description: 'Successfully updated hat',
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

  const { isLoading } = useWaitForTransaction({
    hash,
  });

  return {
    writeAsync,
    prepareError,
    writeError,
    isLoading: isLoadingWearerResolvedAddress || isLoading,
    wearerResolvedAddress,
  };
};

export default useHatWearerStatusSet;

interface UseHatWearerStatusUpdateProps {
  hatsAddress: `0x${string}`;
  chainId: number;
  hatId: string;
  wearer: string;
  eligibility: boolean;
  standing: boolean;
}

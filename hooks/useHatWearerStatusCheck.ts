import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import { isAddress } from 'viem';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import abi from '@/contracts/Hats.json';
import useToast from '@/hooks/useToast';
import { decimalId, toTreeId } from '@/lib/hats';

const useHatWearerStatusCheck = ({
  hatData,
  wearerAddress,
  chainId,
}: {
  hatData: any;
  wearerAddress: string | undefined;
  chainId: number;
}) => {
  //
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<`0x${string}`>();

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'checkHatWearerStatus',
    args: [decimalId(_.get(hatData, 'id')), wearerAddress],
    enabled:
      Boolean(decimalId(_.get(hatData, 'id'))) &&
      Boolean(wearerAddress) &&
      wearerAddress
        ? isAddress(wearerAddress)
        : false,
  });

  const { writeAsync, error: writeError } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      setHash(data.hash);

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
    hash,
  });

  return { writeAsync, prepareError, writeError, isLoading };
};

export default useHatWearerStatusCheck;

import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { useState } from 'react';

import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import abi from '@/contracts/Hats.json';
import useToast from '@/hooks/useToast';
import { idToPrettyId, prettyIdToIp, toTreeId } from '@/lib/hats';

const useHatCheckStatus = ({
  chainId,
  hatId,
}: {
  chainId: number;
  hatId: string;
}) => {
  console.log('hatId', hatId);
  const { handlePendingTx } = useOverlay();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<`0x${string}`>();

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'checkHatStatus',
    args: [hatId],
    enabled: !!hatId,
  });
  console.log('prepareError', prepareError?.message);

  const { writeAsync } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      setHash(data.hash);

      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: 'Status tested!',
          description: `Successfully tested the status for hat #${prettyIdToIp(
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

  console.log('writeAsync', writeAsync);

  const { isLoading } = useWaitForTransaction({
    hash,
  });

  return { writeAsync, isLoading, prepareError };
};

export default useHatCheckStatus;

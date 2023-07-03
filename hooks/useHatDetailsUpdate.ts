import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import CONFIG, { ZERO_ADDRESS } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import abi from '@/contracts/Hats.json';
import useToast from '@/hooks/useToast';
import { decimalId, idToPrettyId, prettyIdToIp, toTreeId } from '@/lib/hats';

const useHatDetailsUpdate = ({
  hatsAddress,
  chainId,
  hatId,
  details,
}: {
  hatsAddress?: `0x${string}`;
  chainId: number;
  hatId: string | undefined;
  details: string | null;
}) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<`0x${string}`>();

  const { config } = usePrepareContractWrite({
    address: hatsAddress || CONFIG.hatsAddress,
    chainId: Number(chainId),
    abi,
    functionName: 'changeHatDetails',
    args: [
      decimalId(hatId) || ZERO_ADDRESS, // not a valid fallback? enabled handles, mostly for type
      details || '',
    ],
    enabled: !!hatsAddress && !!hatId && !!details,
  });

  const { writeAsync } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      setHash(data.hash);

      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx({
        hash: data.hash,
        toastData: {
          title: 'Details updated!',
          description: `Successfully updated the details for hat #${prettyIdToIp(
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

  return { writeAsync, isLoading };
};

export default useHatDetailsUpdate;

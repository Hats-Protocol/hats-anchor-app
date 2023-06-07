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
import { decimalId, idToPrettyId, prettyIdToIp, toTreeId } from '@/lib/hats';

const useHatMakeImmutable = ({ hatsAddress, chainId, hatData }) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState();

  const { config } = usePrepareContractWrite({
    address: hatsAddress || CONFIG.hatsAddress,
    chainId: Number(chainId),
    abi,
    functionName: 'makeHatImmutable',
    args: [
      decimalId(_.get(hatData, 'id')), // not a valid fallback? enabled handles, mostly for type
    ],
    enabled:
      !!hatsAddress &&
      !!decimalId(_.get(hatData, 'id')) &&
      _.gt(_.get(hatData, 'levelAtLocalTree'), 0),
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
          title: 'Hat Updated!',
          description: `Successfully made hat #${prettyIdToIp(
            idToPrettyId(_.get(hatData, 'id')),
          )} immutable`,
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
    hash,
  });

  return { writeAsync, isLoading };
};

export default useHatMakeImmutable;

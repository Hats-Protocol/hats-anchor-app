import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import abi from '@/contracts/Hats.json';
import useToast from '@/hooks/useToast';
import {
  decimalId,
  idToPrettyId,
  isAdmin,
  prettyIdToIp,
  toTreeId,
} from '@/lib/hats';
import { IHat } from '@/types';

import useWearerDetails from './useWearerDetails';

const useHatMakeImmutable = ({
  hatsAddress,
  chainId,
  hatData,
  levelAtLocalTree,
}: UseHatMakeImmutableProps) => {
  const toast = useToast();
  const { address } = useAccount();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<`0x${string}`>();

  const { data: wearerHats } = useWearerDetails({ wearerAddress: address });

  const { config } = usePrepareContractWrite({
    address: hatsAddress || CONFIG.hatsAddress,
    chainId: Number(chainId),
    abi,
    functionName: 'makeHatImmutable',
    args: [decimalId(hatData?.id)],
    enabled:
      !!hatsAddress &&
      !!decimalId(hatData?.id) &&
      _.gt(levelAtLocalTree, 0) &&
      isAdmin(_.map(wearerHats, 'id'), hatData?.id),
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
            idToPrettyId(hatData.id),
          )} immutable`,
        },
      });

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['hatDetails', hatData.id],
        });
        queryClient.invalidateQueries({
          queryKey: ['treeDetails', toTreeId(hatData.id)],
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

interface UseHatMakeImmutableProps {
  hatsAddress?: `0x${string}`;
  chainId: number;
  hatData: IHat;
  levelAtLocalTree: number;
}

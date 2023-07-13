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

const useMintHat = ({ hatsAddress, hatId, chainId, newWearer }: UseMintHat) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<`0x${string}`>();
  console.log(hatsAddress, decimalId(hatId), newWearer);
  console.log(
    Boolean(hatsAddress) && Boolean(decimalId(hatId)) && isAddress(newWearer),
  );

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'mintHat',
    args: [decimalId(hatId), newWearer],
    enabled:
      Boolean(hatsAddress) && Boolean(decimalId(hatId)) && isAddress(newWearer),
  });

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
          title: `Hats Minted!`,
          description: `Successfully minted hat`,
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
        });
      }
    },
  });

  const { isLoading } = useWaitForTransaction({
    hash,
  });

  return {
    writeAsync,
    isLoading,
    prepareError,
    writeError,
  };
};

export default useMintHat;

interface UseMintHat {
  hatsAddress?: `0x${string}`;
  hatId: string | undefined;
  chainId: number;
  newWearer: string;
}

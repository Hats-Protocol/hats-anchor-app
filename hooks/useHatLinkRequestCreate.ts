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
import { prettyIdToIp, decimalId, prettyIdToId, toTreeId } from '@/lib/hats';

const useHatLinkRequestCreate = ({
  topHatDomain,
  newAdmin,
  chainId,
}: UseHatLinkRequestCreateProps) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<`0x${string}`>();

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'requestLinkTopHatToTree',
    args: [topHatDomain, decimalId(prettyIdToId(newAdmin))],
    enabled: Boolean(topHatDomain) && Boolean(newAdmin),
  });
  console.log('hatLinkRequestCreate - prepareError', prepareError);

  const { writeAsync } = useContractWrite({
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
          title: `Successfully Requested to Link!`,
          description: `Successfully requested to link top hat ${prettyIdToIp(
            topHatDomain,
          )} to ${prettyIdToIp(newAdmin)}`,
        },
      });

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['hatDetails', prettyIdToId(newAdmin)],
        });
        queryClient.invalidateQueries({
          queryKey: ['hatDetails', prettyIdToId(topHatDomain)],
        });
        queryClient.invalidateQueries({
          queryKey: ['treeDetails', topHatDomain],
        });
        queryClient.invalidateQueries({
          queryKey: ['treeDetails', toTreeId(newAdmin)],
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

  return { writeAsync, prepareError, isLoading };
};

export default useHatLinkRequestCreate;

interface UseHatLinkRequestCreateProps {
  topHatDomain: string;
  newAdmin: string;
  chainId: number;
}

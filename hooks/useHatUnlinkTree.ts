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
import { prettyIdToIp } from '@/lib/hats';

const useHatUnlinkTree = ({
  topHatPrettyId,
  wearer,
  chainId,
}: {
  topHatPrettyId: string;
  wearer: string;
  chainId: number;
}) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const [hash, setHash] = useState<`0x${string}`>();

  const { config } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'unlinkTopHatFromTree',
    args: [topHatPrettyId, wearer],
    enabled: Boolean(topHatPrettyId) && Boolean(wearer) && isAddress(wearer),
  });

  const { writeAsync } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      setHash(data.hash);

      handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: `Top Hat Unlinked!`,
          description: `Successfully unlinked top hat #${prettyIdToIp(
            topHatPrettyId,
          )}`,
        },
      });

      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });
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
    isLoading,
  };
};

export default useHatUnlinkTree;

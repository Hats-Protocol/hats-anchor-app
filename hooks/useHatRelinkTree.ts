import _ from 'lodash';
import { useState } from 'react';
import {
  useContractWrite,
  useEnsAddress,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import CONFIG, { FALLBACK_ADDRESS } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import abi from '@/contracts/Hats.json';
import useToast from '@/hooks/useToast';
import { decimalId, prettyIdToId, prettyIdToIp } from '@/lib/hats';

const useHatRelinkTree = ({
  topHatDomain,
  newAdmin,
  eligibility,
  toggle,
  description,
  imageUrl,
  chainId,
}: UseHatRelinkTreeProps) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const [hash, setHash] = useState<`0x${string}`>();

  const {
    data: eligibilityResolvedAddress,
    isLoading: isLoadingEligibilityResolvedAddress,
  } = useEnsAddress({
    name: eligibility,
    chainId: 1,
  });

  const {
    data: toggleResolvedAddress,
    isLoading: isLoadingtoggleResolvedAddress,
  } = useEnsAddress({
    name: toggle,
    chainId: 1,
  });

  const eligibilityAddress =
    (eligibilityResolvedAddress ?? eligibility) || FALLBACK_ADDRESS;
  const toggleAddress = (toggleResolvedAddress ?? toggle) || FALLBACK_ADDRESS;

  const { config } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'relinkTopHatWithinTree',
    args: [
      topHatDomain,
      decimalId(prettyIdToId(newAdmin)),
      eligibilityAddress,
      toggleAddress,
      description,
      imageUrl || '',
    ],
    enabled: !!topHatDomain && !!newAdmin,
  });

  const { writeAsync } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      setHash(data.hash);

      handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: 'Top Hat Relinked!',
          description: `Successfully relinked top hat ${prettyIdToIp(
            topHatDomain,
          )} to ${prettyIdToIp(newAdmin)}`,
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
    isLoading:
      isLoadingEligibilityResolvedAddress ||
      isLoadingtoggleResolvedAddress ||
      isLoading,
    eligibilityResolvedAddress,
    toggleResolvedAddress,
  };
};

export default useHatRelinkTree;

interface UseHatRelinkTreeProps {
  topHatDomain: string;
  newAdmin: string;
  eligibility: string;
  toggle: string;
  description: string;
  imageUrl: string;
  chainId: number;
}

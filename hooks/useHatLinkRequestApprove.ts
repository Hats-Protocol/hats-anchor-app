import { useQueryClient } from '@tanstack/react-query';
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
import {
  decimalId,
  idToPrettyId,
  prettyIdToId,
  prettyIdToIp,
  toTreeId,
} from '@/lib/hats';

const useHatLinkRequestApprove = ({
  chainId,
  topHatDomain,
  newAdmin,
  eligibility,
  toggle,
  description,
  imageUrl,
}: UseHatLinkRequestApproveProps) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
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

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'approveLinkTopHatToTree',
    args: [
      topHatDomain,
      decimalId(newAdmin),
      eligibilityAddress,
      toggleAddress,
      description,
      imageUrl || '',
    ],
    enabled: !!topHatDomain && !!newAdmin,
  });
  console.log('hatLinkRequestApprove - prepareError', prepareError);

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
          title: 'Link Request Approved!',
          description: `Successfully linked top hat ${prettyIdToIp(
            topHatDomain,
          )} to ${prettyIdToIp(idToPrettyId(newAdmin))}`,
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

  return {
    writeAsync,
    isLoading:
      isLoadingEligibilityResolvedAddress ||
      isLoadingtoggleResolvedAddress ||
      isLoading,
    prepareError,
    writeError,
    eligibilityResolvedAddress,
    toggleResolvedAddress,
  };
};

export default useHatLinkRequestApprove;

interface UseHatLinkRequestApproveProps {
  chainId: number;
  topHatDomain: string;
  newAdmin: string;
  eligibility: string;
  toggle: string;
  description: string;
  imageUrl: string;
}

import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useEnsAddress,
} from 'wagmi';
import { useState } from 'react';

import CONFIG, { ZERO_ADDRESS, FALLBACK_ADDRESS } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import abi from '@/contracts/Hats.json';
import useToast from '@/hooks/useToast';
import { prettyIdToId } from '@/lib/hats';

const useHatCreate = ({
  hatsAddress,
  chainId,
  treeId,
  admin,
  details,
  maxSupply,
  eligibility,
  toggle,
  mutable,
  imageUrl,
}: UseHatCreateProps) => {
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
    isLoading: isLoadingToggleResolvedAddress,
  } = useEnsAddress({
    name: toggle,
    chainId: 1,
  });

  const eligibilityAddress =
    (eligibilityResolvedAddress ?? eligibility) || FALLBACK_ADDRESS;
  const toggleAddress = (toggleResolvedAddress ?? toggle) || FALLBACK_ADDRESS;

  const { config } = usePrepareContractWrite({
    address: hatsAddress || CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'createHat',
    args: [
      prettyIdToId(admin) || ZERO_ADDRESS, // not a valid fallback? throw instead?
      details || '',
      maxSupply || '1',
      eligibilityAddress,
      toggleAddress,
      mutable === 'Mutable',
      imageUrl || '',
    ],
    enabled: !!hatsAddress && !!admin,
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
        hash: _.get(data, 'hash'),
        toastData: {
          title: 'Hat Created',
          description: 'Successfully created hat',
        },
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['treeDetails', treeId] });
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
    toggleResolvedAddress: toggleAddress,
    eligibilityResolvedAddress: eligibilityAddress,
    isLoading:
      isLoadingEligibilityResolvedAddress ||
      isLoadingToggleResolvedAddress ||
      isLoading,
  };
};

export default useHatCreate;

interface UseHatCreateProps {
  hatsAddress: `0x${string}`;
  chainId: number;
  treeId: string;
  admin: string | undefined;
  details: string;
  maxSupply: number;
  eligibility: string;
  toggle: string;
  mutable: string;
  imageUrl: string;
}

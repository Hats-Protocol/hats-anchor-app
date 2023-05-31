import {
  usePrepareContractWrite,
  useContractWrite,
  useEnsAddress,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import CONFIG, { FALLBACK_ADDRESS } from '@/constants';
import abi from '@/contracts/Hats.json';
import { useOverlay } from '@/contexts/OverlayContext';
import {
  decimalId,
  idToPrettyId,
  prettyIdToIp,
  prettyIdToId,
  toTreeId,
} from '@/lib/hats';
import useToast from './useToast';

const useHatLinkRequestApprove = ({
  chainId,
  topHatDomain,
  newAdmin,
  eligibility,
  toggle,
  description,
  imageUrl,
}) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();

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

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'approveLinkTopHatToTree',
    args: [
      topHatDomain,
      decimalId(newAdmin),
      (eligibilityResolvedAddress ?? eligibility) || FALLBACK_ADDRESS,
      (toggleResolvedAddress ?? toggle) || FALLBACK_ADDRESS,
      description,
      imageUrl || '',
    ],
    enabled: !!topHatDomain && !!newAdmin,
  });
  console.log('hatLinkRequestApprove - prepareError', prepareError);

  const {
    writeAsync,
    error: writeError,
    data: writeData,
  } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
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
    hash: writeData?.hash,
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

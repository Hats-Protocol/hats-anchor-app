import {
  usePrepareContractWrite,
  useContractWrite,
  useEnsAddress,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import CONFIG, { FALLBACK_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';
import { decimalId, idToPrettyId, prettyIdToIp } from '../lib/hats';

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

  const {
    data: eligibilityResolvedAddress,
    isError: isErrorEligibilityResolvedAddress,
    isLoading: isLoadingEligibilityResolvedAddress,
  } = useEnsAddress({
    name: eligibility,
    chainId: 1,
  });
  const {
    data: toggleResolvedAddress,
    isLoading: isLoadingtoggleResolvedAddress,
    isError: isErrorToggleResolvedAddress,
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
      eligibilityResolvedAddress || FALLBACK_ADDRESS,
      toggleResolvedAddress || FALLBACK_ADDRESS,
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
    onSuccess: (data) => {
      handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: 'Link Request Approved!',
          description: `Successfully linked top hat ${prettyIdToIp(
            topHatDomain,
          )} to ${prettyIdToIp(idToPrettyId(newAdmin))}`,
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
    hash: writeData?.hash,
  });

  return {
    writeAsync,
    ensError: isErrorEligibilityResolvedAddress || isErrorToggleResolvedAddress,
    isLoading:
      isLoadingEligibilityResolvedAddress ||
      isLoadingtoggleResolvedAddress ||
      isLoading,
    prepareError,
    writeError,
  };
};

export default useHatLinkRequestApprove;

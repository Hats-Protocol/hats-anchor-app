import {
  usePrepareContractWrite,
  useContractWrite,
  useEnsAddress,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { hatsAddresses, FALLBACK_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';
import { prettyIdToIp, decimalId, prettyIdToId } from '../lib/hats';

const useHatRelinkTree = ({
  topHatDomain,
  newAdmin,
  eligibility,
  toggle,
  description,
  imageUrl,
  chainId,
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

  const { config } = usePrepareContractWrite({
    address: hatsAddresses(chainId),
    chainId,
    abi: JSON.stringify(abi),
    functionName: 'relinkTopHatWithinTree',
    args: [
      topHatDomain,
      decimalId(prettyIdToId(newAdmin)),
      eligibilityResolvedAddress || FALLBACK_ADDRESS,
      toggleResolvedAddress || FALLBACK_ADDRESS,
      description,
      imageUrl || '',
    ],
    enabled: !!topHatDomain && !!newAdmin,
  });
  const { writeAsync, data: writeData } = useContractWrite({
    ...config,
    onSuccess: (data) => {
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
    hash: writeData?.hash,
  });

  return {
    writeAsync,
    ensError: isErrorEligibilityResolvedAddress || isErrorToggleResolvedAddress,
    isLoading:
      isLoadingEligibilityResolvedAddress ||
      isLoadingtoggleResolvedAddress ||
      isLoading,
  };
};

export default useHatRelinkTree;

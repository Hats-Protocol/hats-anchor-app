import {
  usePrepareContractWrite,
  useContractWrite,
  useEnsAddress,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { isAddress } from 'viem';
import CONFIG from '../constants';
import abi from '../contracts/Hats.json';
import { prettyIdToIp } from '../lib/hats';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';

const useHatUnlinkTree = ({ hatData, wearer, chainId }) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();

  const {
    data: wearerResolvedAddress,
    isError: isErrorWearerResolvedAddress,
    isLoading: isLoadingWearerResolvedAddress,
  } = useEnsAddress({
    name: wearer,
    chainId: 1,
  });

  const { config } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'unlinkTopHatFromTree',
    args: [_.get(hatData, 'prettyId'), wearerResolvedAddress],
    enabled:
      Boolean(_.get(hatData, 'prettyId')) &&
      Boolean(wearer) &&
      isAddress(wearer),
  });

  const { writeAsync, data: writeData } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: `Top Hat Unlinked!`,
          description: `Successfully unlinked top hat #${prettyIdToIp(
            _.get(hatData, 'prettyId'),
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
    hash: writeData?.hash,
  });

  return {
    writeAsync,
    ensError: isErrorWearerResolvedAddress,
    isLoading: isLoadingWearerResolvedAddress || isLoading,
  };
};

export default useHatUnlinkTree;

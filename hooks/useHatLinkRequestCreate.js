import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import CONFIG from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';
import { prettyIdToIp, decimalId, prettyIdToId } from '../lib/hats';

const useHatLinkRequestCreate = ({ topHatDomain, newAdmin, chainId }) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'requestLinkTopHatToTree',
    args: [topHatDomain, decimalId(prettyIdToId(newAdmin))],
    enabled: Boolean(topHatDomain) && Boolean(newAdmin),
  });
  console.log('hatLinkRequestCreate - prepareError', prepareError);

  const { writeAsync, data: writeData } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: `Successfully Requested to Link!`,
          description: `Successfully requested to link top hat ${prettyIdToIp(
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

  return { writeAsync, prepareError, isLoading };
};

export default useHatLinkRequestCreate;

import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import _ from 'lodash';
import CONFIG from '../constants';
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

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'relinkTopHatWithinTree',
    args: [
      topHatDomain,
      decimalId(prettyIdToId(newAdmin)),
      eligibility,
      toggle,
      description,
      imageUrl || '',
    ],
    enabled: !!topHatDomain && !!newAdmin,
  });
  console.log('hatRelink - prepareError', prepareError);

  const { writeAsync } = useContractWrite({
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

  return { writeAsync };
};

export default useHatRelinkTree;

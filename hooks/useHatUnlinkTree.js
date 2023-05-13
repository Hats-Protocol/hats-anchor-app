import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import _ from 'lodash';
import { hatsAddresses } from '../constants';
import abi from '../contracts/Hats.json';
import { prettyIdToIp } from '../lib/hats';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';

const useHatUnlinkTree = ({ hatData, wearer, chainId }) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();

  const { config, error: prepareError } = usePrepareContractWrite({
    address: hatsAddresses(chainId),
    chainId,
    abi: JSON.stringify(abi),
    functionName: 'unlinkTopHatFromTree',
    args: [_.get(hatData, 'prettyId'), wearer],
    enabled: Boolean(_.get(hatData, 'prettyId')) && Boolean(wearer),
  });

  const { writeAsync, error: writeError } = useContractWrite({
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

  return { writeAsync, prepareError, writeError };
};

export default useHatUnlinkTree;

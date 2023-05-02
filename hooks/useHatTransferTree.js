import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import _ from 'lodash';
import { hatsAddresses } from '../constants';
import abi from '../contracts/Hats.json';
import { decimalId, prettyIdToIp } from '../lib/hats';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';

const useHatTransferTree = ({
  currentWearerAddress,
  hatData,
  newWearerAddress,
  chainId,
}) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();

  const { config, error: prepareError } = usePrepareContractWrite({
    address: hatsAddresses(chainId),
    chainId,
    abi: JSON.stringify(abi),
    functionName: 'transferHat',
    args: [decimalId(hatData.id), currentWearerAddress, newWearerAddress],
    enabled: Boolean(newWearerAddress),
  });

  const { writeAsync, error: writeError } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: `Top Hat Transferred!`,
          description: `Successfully transferred top hat #${prettyIdToIp(
            _.get(hatData, 'prettyId'),
          )} from ${currentWearerAddress} to ${newWearerAddress}`,
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

export default useHatTransferTree;

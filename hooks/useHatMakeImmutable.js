import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import _ from 'lodash';
import { hatsAddresses } from '../constants';
import abi from '../contracts/Hats.json';
import { decimalId } from '../lib/hats';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';

const useHatMakeImmutable = ({ hatsAddress, chainId, hatData }) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();

  const { config } = usePrepareContractWrite({
    address: hatsAddress || hatsAddresses(chainId),
    chainId: Number(chainId),
    abi: JSON.stringify(abi),
    functionName: 'makeHatImmutable',
    args: [
      decimalId(_.get(hatData, 'id')), // not a valid fallback? enabled handles, mostly for type
    ],
    enabled:
      !!hatsAddress &&
      !!decimalId(_.get(hatData, 'id')) &&
      _.gt(_.get(hatData, 'levelAtLocalTree'), 0),
  });

  const { writeAsync } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      handlePendingTx({
        hash: data.hash,
        toastData: {
          title: 'Hat Updated!',
          description: `Successfully made hat #${_.get(
            data,
            'prettyId',
          )} immutable`,
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

export default useHatMakeImmutable;

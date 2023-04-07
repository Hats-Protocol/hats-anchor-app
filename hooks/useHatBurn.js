import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import _ from 'lodash';
import { hatsAddresses } from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';

const useHatBurn = ({ hatsAddress, chainId, hatId }) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();

  const { config } = usePrepareContractWrite({
    address: hatsAddress || hatsAddresses(chainId),
    chainId,
    abi: JSON.stringify(abi),
    functionName: 'renounceHat',
    args: [hatId],
    enabled: !!hatsAddress && !!hatId,
  });

  const { writeAsync } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: 'Hat removed!',
          description: `Successfully removed hat`,
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

export default useHatBurn;

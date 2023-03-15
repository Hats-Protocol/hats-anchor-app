import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import _ from 'lodash';
import { isAddress } from '@ethersproject/address';
import { hatsAddresses, ZERO_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';
import { decimalId } from '../lib/hats';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';

const useHatMint = ({ hatsAddress, hatId, chainId, newWearer }) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();

  const { config } = usePrepareContractWrite({
    address: hatsAddresses(chainId),
    chainId,
    abi: JSON.stringify(abi),
    functionName: 'mintHat',
    args: [decimalId(hatId), newWearer || ZERO_ADDRESS],
    enabled:
      Boolean(hatsAddress) &&
      Boolean(decimalId(hatId)) &&
      Boolean(newWearer) &&
      isAddress(newWearer),
  });

  const { writeAsync } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: `Hat Minted!`,
          description: `Successfully minted hat`,
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

export default useHatMint;

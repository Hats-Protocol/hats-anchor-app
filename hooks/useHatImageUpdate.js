import { useState } from 'react';
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { hatsAddresses, ZERO_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';

// TODO rm
const defaultChainId = 5;
const fallbackAddress = hatsAddresses(defaultChainId);

const useHatImageUpdate = ({ hatsAddress, chainId, hatId, image }) => {
  const [hash, setHash] = useState();
  const toast = useToast();

  const { config } = usePrepareContractWrite({
    address: hatsAddress || fallbackAddress,
    chainId: _.toNumber(chainId) || defaultChainId,
    abi: JSON.stringify(abi),
    functionName: 'changeHatImageURI',
    args: [
      hatId || ZERO_ADDRESS, // not a valid fallback? enabled handles, mostly for type
      image || '',
    ],
    enabled: !!hatsAddress && !!hatId && image,
  });

  const { writeAsync } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      setHash(_.get(data, 'hash'));
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
        // track('ZoraMintError');
        toast.error({
          title: 'Error occurred!',
          // description: 'Please accept the transaction in your wallet',
        });
      }
    },
  });

  const { isLoading } = useWaitForTransaction({
    hash,
    onSuccess: () => {
      toast.success({
        title: 'Image updated!',
        description: `Successfully updated the image for hat #${hatId}`,
      });
    },
  });

  return { writeAsync, isLoading };
};

export default useHatImageUpdate;

import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { useState } from 'react';
import { hatsAddresses, ZERO_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';
import { decimalId } from '../lib/hats';

// TODO rm
const defaultChainId = 5;
const fallbackAddress = hatsAddresses(defaultChainId);

const useHatDetailsUpdate = ({ hatsAddress, chainId, hatId, details }) => {
  const toast = useToast();
  const [hash, setHash] = useState();

  const { config } = usePrepareContractWrite({
    address: hatsAddress || fallbackAddress,
    chainId: Number(chainId) || defaultChainId,
    abi: JSON.stringify(abi),
    functionName: 'changeHatDetails',
    args: [
      decimalId(hatId) || ZERO_ADDRESS, // not a valid fallback? enabled handles, mostly for type
      details || '',
    ],
    enabled: !!hatsAddress && !!hatId && !!details,
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
        title: 'Details updated!',
        description: `Successfully updated the details for hat #${hatId}`,
      });
    },
  });

  return { writeAsync, isLoading };
};

export default useHatDetailsUpdate;

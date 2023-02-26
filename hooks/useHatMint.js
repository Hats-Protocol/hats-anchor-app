import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { useState } from 'react';
import { isAddress } from '@ethersproject/address';
import { hatsAddresses, ZERO_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';
import { decimalId } from '../lib/hats';
import useToast from './useToast';

const defaultChainId = 5;
const fallbackAddress = hatsAddresses(defaultChainId);

const useHatMint = ({ hatsAddress, hatId, chainId, newWearer }) => {
  const toast = useToast();
  const [hash, setHash] = useState();

  const { config } = usePrepareContractWrite({
    address: hatsAddress || fallbackAddress,
    chainId: chainId || defaultChainId,
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
        title: `Hat Minted!`,
        description: `Successfully minted hat`,
      });
    },
  });

  return { writeAsync, isLoading };
};

export default useHatMint;

import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useAccount,
} from 'wagmi';
import _ from 'lodash';
import { useState } from 'react';
import { hatsAddresses } from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';

// TODO rm
const defaultChainId = 5;
const fallbackAddress = hatsAddresses(defaultChainId);

const useTreeCreate = ({
  hatsAddress,
  chainId,
  details,
  receiver,
  overrideReceiver,
  imageUrl,
}) => {
  const { address } = useAccount();
  const toast = useToast();
  const [hash, setHash] = useState();

  const { config } = usePrepareContractWrite({
    address: hatsAddress || fallbackAddress,
    chainId: chainId || defaultChainId,
    abi: JSON.stringify(abi),
    functionName: 'mintTopHat',
    args: [
      overrideReceiver ? receiver : address,
      details || '',
      imageUrl || '',
    ],
    enabled: !!hatsAddress,
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
    onSuccess: (data) => {
      // eslint-disable-next-line no-console
      console.log(data);
      toast.success({
        title: 'Tree created!',
        description: `Successfully created tree`,
      });
    },
  });

  return { writeAsync, isLoading };
};

export default useTreeCreate;

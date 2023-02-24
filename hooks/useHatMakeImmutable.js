import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { useState } from 'react';
import { hatsAddresses, ZERO_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';
import { decimalId } from '../lib/hats';
import useToast from './useToast';

// TODO rm
const defaultChainId = 5;
const fallbackAddress = hatsAddresses(defaultChainId);

const useHatMakeImmutable = ({ hatsAddress, chainId, hatData }) => {
  const toast = useToast();
  const [hash, setHash] = useState();

  const { config } = usePrepareContractWrite({
    address: hatsAddress || fallbackAddress,
    chainId: Number(chainId) || defaultChainId,
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

  useWaitForTransaction({
    hash,
    onSuccess: () => {
      toast.success({
        title: 'Hat Updated!',
        description: `Successfully made hat #${_.get(
          hatData,
          'prettyId',
        )} immutable`,
      });
    },
  });

  return { writeAsync };
};

export default useHatMakeImmutable;

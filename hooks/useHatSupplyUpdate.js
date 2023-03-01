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

const useHatSupplyUpdate = ({ hatsAddress, chainId, hatId, amount }) => {
  const toast = useToast();
  const [hash, setHash] = useState();

  const { config } = usePrepareContractWrite({
    address: hatsAddress || hatsAddresses(chainId),
    chainId: _.toNumber(chainId),
    abi: JSON.stringify(abi),
    functionName: 'changeHatMaxSupply',
    args: [
      decimalId(hatId) || ZERO_ADDRESS, // not a valid fallback? enabled handles, mostly for type
      amount || 1,
    ],
    enabled: !!hatsAddress && !!hatId && !!amount,
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
        });
      }
    },
  });

  const { isLoading } = useWaitForTransaction({
    hash,
    onSuccess: () => {
      toast.success({
        title: 'Max Supply updated!',
        description: `Successfully updated the max supply of hat #${hatId}`,
      });
    },
  });

  return { writeAsync, isLoading };
};

export default useHatSupplyUpdate;

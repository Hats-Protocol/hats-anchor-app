import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import _ from 'lodash';
import { useState } from 'react';
import { utils } from 'ethers';
import { hatsAddresses, MODULE_TYPES, ZERO_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';
import { decimalId } from '../lib/hats';

// TODO rm
const defaultChainId = 5;
const fallbackAddress = hatsAddresses(defaultChainId);

const useModuleUpdate = ({
  hatsAddress,
  chainId,
  hatId,
  moduleType,
  newAddress,
}) => {
  const toast = useToast();
  const [hash, setHash] = useState();

  const functionName =
    moduleType === MODULE_TYPES.eligibility
      ? 'changeHatEligibility'
      : 'changeHatToggle';

  const { config } = usePrepareContractWrite({
    address: hatsAddress || fallbackAddress,
    chainId: _.toNumber(chainId) || defaultChainId,
    abi: JSON.stringify(abi),
    functionName,
    args: [decimalId(hatId), newAddress || ZERO_ADDRESS],
    enabled:
      !!hatsAddress &&
      !!moduleType &&
      !!hatId &&
      !!newAddress &&
      utils.isAddress(newAddress),
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
        title: `${moduleType} module updated!`,
        description: `Successfully updated the ${moduleType} module of hat #${hatId}`,
      });
    },
  });

  return { writeAsync, isLoading };
};

export default useModuleUpdate;

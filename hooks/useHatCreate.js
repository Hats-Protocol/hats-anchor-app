import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import _ from 'lodash';
import { hatsAddresses, ZERO_ADDRESS, FALLBACK_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';
import { prettyIdToId } from '../lib/hats';
import { useOverlay } from '../contexts/OverlayContext';
import { useQueryClient } from '@tanstack/react-query';

const useHatCreate = ({
  hatsAddress,
  chainId,
  treeId,
  admin,
  details,
  maxSupply,
  eligibility,
  toggle,
  mutable,
  imageUrl,
}) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();

  const { config, error: prepareError } = usePrepareContractWrite({
    address: hatsAddress || hatsAddresses(chainId),
    chainId,
    abi: JSON.stringify(abi),
    functionName: 'createHat',
    args: [
      prettyIdToId(admin) || ZERO_ADDRESS, // not a valid fallback? throw instead?
      details || '',
      maxSupply || '1',
      eligibility || FALLBACK_ADDRESS,
      toggle || FALLBACK_ADDRESS,
      mutable === 'Mutable',
      imageUrl || '',
    ],
    enabled: !!hatsAddress && !!admin,
  });
  console.log(prepareError);

  const { writeAsync } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: 'Hat Created',
          description: 'Successfully created hat',
        },
        treeId,
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

export default useHatCreate;

import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import _ from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import CONFIG, { ZERO_ADDRESS, FALLBACK_ADDRESS } from '@/constants';
import abi from '@/contracts/Hats.json';
import useToast from './useToast';
import { prettyIdToId } from '@/lib/hats';
import { useOverlay } from '@/contexts/OverlayContext';

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
    address: hatsAddress || CONFIG.hatsAddress,
    chainId,
    abi,
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
  console.log('hatCreate - prepareError', prepareError);

  const { writeAsync } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: 'Hat Created',
          description: 'Successfully created hat',
        },
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['treeDetails', treeId] });
      }, 4000);
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

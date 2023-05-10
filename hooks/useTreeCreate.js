import { usePrepareContractWrite, useContractWrite, useAccount } from 'wagmi';
import _ from 'lodash';
import { hatsAddresses } from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';
import { useQueryClient } from '@tanstack/react-query';

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
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();

  const { config } = usePrepareContractWrite({
    address: hatsAddress || hatsAddresses(chainId),
    chainId,
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
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: 'Tree created!',
          description: `Successfully created tree`,
        },
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['treeList', chainId] });
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

export default useTreeCreate;

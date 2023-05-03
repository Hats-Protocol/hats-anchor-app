import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useContractEvent,
} from 'wagmi';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { BigNumber } from 'ethers';
import { hatsAddresses } from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';
import { treeCreateEventIdToTreeId } from '../lib/hats';

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
  const router = useRouter();

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

  useContractEvent({
    address: hatsAddress || hatsAddresses(chainId),
    abi: JSON.stringify(abi),
    eventName: 'HatCreated',
    listener(id) {
      if (!id || !BigNumber.isBigNumber(id)) {
        return;
      }
      const treeId = treeCreateEventIdToTreeId(id);
      router.push(`/trees/${chainId}/${treeId}/${treeId}`);
    },
  });

  const { writeAsync } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: 'Tree created!',
          description: `Successfully created tree`,
        },
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

export default useTreeCreate;

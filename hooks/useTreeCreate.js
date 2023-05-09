import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useContractEvent,
  useWaitForTransaction,
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

  function handleSuccess(transactionData) {
    const id = transactionData?.logs[0]?.data;
    const treeId = treeCreateEventIdToTreeId(id);
    if (!treeId) return;
    router.push(`/trees/${chainId}/${treeId}/${treeId}`);
  }

  function handleError(error) {
    console.error(error);
  }

  const { writeAsync, data: writeData } = useContractWrite({
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

  const { isLoading } = useWaitForTransaction({
    hash: writeData?.hash,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  return { writeAsync, isLoading };
};

export default useTreeCreate;

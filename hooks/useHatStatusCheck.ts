import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import CONFIG, { STATUS } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import abi from '@/contracts/Hats.json';
import useToast from '@/hooks/useToast';
import { checkAddressIsContract } from '@/lib/contract';
import { decimalId, toTreeId } from '@/lib/hats';

const useHatStatusCheck = ({
  hatData,
  chainId,
}: {
  hatData: any;
  chainId: number;
}) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<`0x${string}`>();
  const [toggleIsContract, setToggleIsContract] = useState(false);
  const [testingToggle, setTestingToggle] = useState(false);

  useEffect(() => {
    const testToggle = async () => {
      setTestingToggle(true);
      const localData = await checkAddressIsContract(hatData.toggle, chainId);
      setToggleIsContract(localData);
      setTestingToggle(false);
    };
    testToggle();
  }, [hatData, chainId]);

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId,
    abi,
    functionName: 'checkHatStatus',
    args: [decimalId(_.get(hatData, 'id'))],
    enabled: Boolean(decimalId(_.get(hatData, 'id'))) && toggleIsContract,
  });

  const { writeAsync, error: writeError } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      setHash(data.hash);

      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      const { logs } = await handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: `Hat Minted!`,
          description: `Successfully minted hat`,
        },
      });

      if (logs?.length === 0) {
        toast.success({
          title: 'Status Check Completed',
          description: `No change: Hat Status remains ${
            hatData.status ? STATUS.ACTIVE : STATUS.INACTIVE
          }`,
        });
      } else {
        toast.success({
          title: 'Status Check Completed',
          description: `Hat Status Changed to ${
            logs[0].data.slice(-1) === '1' ? STATUS.ACTIVE : STATUS.INACTIVE
          }`,
        });

        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['hatDetails', _.get(hatData, 'id')],
          });
          queryClient.invalidateQueries({
            queryKey: ['treeDetails', toTreeId(_.get(hatData, 'id'))],
          });
        }, 4000);
      }
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
    hash,
  });

  return {
    writeAsync,
    prepareError,
    writeError,
    isLoading: isLoading || testingToggle,
    toggleIsContract,
  };
};

export default useHatStatusCheck;

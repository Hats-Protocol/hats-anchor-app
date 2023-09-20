import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Hex } from 'viem';
import {
  useChainId,
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
import { IHat } from '@/types';

const useHatStatusCheck = ({
  hatData,
  chainId,
}: {
  hatData?: IHat;
  chainId?: number;
}) => {
  const toast = useToast();
  const currentNetworkId = useChainId();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<Hex>();
  const [toggleIsContract, setToggleIsContract] = useState(false);
  const [testingToggle, setTestingToggle] = useState(false);

  useEffect(() => {
    const testToggle = async () => {
      setTestingToggle(true);
      const localData = await checkAddressIsContract(hatData?.toggle, chainId);
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
    enabled:
      Boolean(decimalId(_.get(hatData, 'id'))) &&
      toggleIsContract &&
      currentNetworkId === chainId,
  });

  const { writeAsync, error: writeError } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      setHash(data.hash);

      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      const { logs } = _.pick(
        await handlePendingTx?.({
          hash: _.get(data, 'hash'),
          toastData: {
            title: 'Transaction Confirmed',
            description: 'Checking Hat Status...',
          },
        }),
        ['logs'],
      );

      if (logs?.length === 0) {
        toast.success({
          title: 'Status Check Completed',
          description: `No change: Hat Status remains ${
            hatData?.status ? STATUS.ACTIVE : STATUS.INACTIVE
          }`,
        });
      } else {
        const logData = _.get(_.first(logs), 'data');
        toast.success({
          title: 'Status Check Completed',
          description: `Hat Status Changed to ${
            _.first(_.slice(logData, -1, _.size(logData))) === '1'
              ? STATUS.ACTIVE
              : STATUS.INACTIVE
          }`,
        });

        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['hatDetails', { id: _.get(hatData, 'id'), chainId }],
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

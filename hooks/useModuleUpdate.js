import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { isAddress } from 'viem';
import {
  usePrepareContractWrite,
  useContractWrite,
  useEnsAddress,
  useWaitForTransaction,
} from 'wagmi';

import CONFIG, { MODULE_TYPES, ZERO_ADDRESS } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import abi from '@/contracts/Hats.json';
import useToast from '@/hooks/useToast';
import { prettyIdToIp, idToPrettyId, decimalId, toTreeId } from '@/lib/hats';

const useModuleUpdate = ({
  hatsAddress,
  chainId,
  hatId,
  moduleType,
  newAddress,
}) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();

  const { data: newResolvedAddress, isLoading: isLoadingNewResolvedAddress } =
    useEnsAddress({
      name: newAddress,
      chainId: 1,
    });

  const functionName =
    moduleType === MODULE_TYPES.eligibility
      ? 'changeHatEligibility'
      : 'changeHatToggle';

  const { config } = usePrepareContractWrite({
    address: hatsAddress || CONFIG.hatsAddress,
    chainId: _.toNumber(chainId),
    abi,
    functionName,
    args: [
      decimalId(hatId),
      (newResolvedAddress ?? newAddress) || ZERO_ADDRESS,
    ],
    enabled:
      !!hatsAddress &&
      !!moduleType &&
      !!hatId &&
      !!newAddress &&
      isAddress(newAddress),
  });

  const { writeAsync, data: writeData } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: `${moduleType} module updated!`,
          description: `Successfully updated the ${moduleType} module of hat #${prettyIdToIp(
            idToPrettyId(hatId),
          )}`,
        },
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['hatDetails', hatId] });
        queryClient.invalidateQueries({
          queryKey: ['treeDetails', toTreeId(hatId)],
        });
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

  const { isLoading } = useWaitForTransaction({
    hash: writeData?.hash,
  });

  return {
    writeAsync,
    isLoading: isLoadingNewResolvedAddress || isLoading,
    newResolvedAddress,
  };
};

export default useModuleUpdate;

import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import _ from 'lodash';
import { utils } from 'ethers';
import { hatsAddresses, MODULE_TYPES, ZERO_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';
import { decimalId } from '../lib/hats';
import { useOverlay } from '../contexts/OverlayContext';

const useModuleUpdate = ({
  hatsAddress,
  chainId,
  hatId,
  moduleType,
  newAddress,
}) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();

  const functionName =
    moduleType === MODULE_TYPES.eligibility
      ? 'changeHatEligibility'
      : 'changeHatToggle';

  const { config } = usePrepareContractWrite({
    address: hatsAddress || hatsAddresses(chainId),
    chainId: _.toNumber(chainId),
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
      handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: `${moduleType} module updated!`,
          description: `Successfully updated the ${moduleType} module of hat #${hatId}`,
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

export default useModuleUpdate;

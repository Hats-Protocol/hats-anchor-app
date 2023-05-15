import {
  usePrepareContractWrite,
  useContractWrite,
  useEnsAddress,
} from 'wagmi';
import _ from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import { hatsAddresses, ZERO_ADDRESS, FALLBACK_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';
import { prettyIdToId } from '../lib/hats';
import { useOverlay } from '../contexts/OverlayContext';

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

  const {
    data: eligibilityResolvedAddress,
    isError: isErrorEligibilityResolvedAddress,
    isLoading: isLoadingEligibilityResolvedAddress,
  } = useEnsAddress({
    name: eligibility,
    chainId: 1,
  });
  const {
    data: toggleResolvedAddress,
    isLoading: isLoadingtoggleResolvedAddress,
    isError: isErrorToggleResolvedAddress,
  } = useEnsAddress({
    name: toggle,
    chainId: 1,
  });

  const { config, error: prepareError } = usePrepareContractWrite({
    address: hatsAddress || hatsAddresses(chainId),
    chainId,
    abi: JSON.stringify(abi),
    functionName: 'createHat',
    args: [
      prettyIdToId(admin) || ZERO_ADDRESS, // not a valid fallback? throw instead?
      details || '',
      maxSupply || '1',
      eligibilityResolvedAddress || FALLBACK_ADDRESS,
      toggleResolvedAddress || FALLBACK_ADDRESS,
      mutable === 'Mutable',
      imageUrl || '',
    ],
    enabled: !!hatsAddress && !!admin,
  });
  console.log(prepareError);

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

  return {
    writeAsync,
    ensError: isErrorEligibilityResolvedAddress || isErrorToggleResolvedAddress,
    isLoading:
      isLoadingEligibilityResolvedAddress || isLoadingtoggleResolvedAddress,
  };
};

export default useHatCreate;

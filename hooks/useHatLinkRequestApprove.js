import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import _ from 'lodash';
import { hatsAddresses } from '../constants';
import abi from '../contracts/Hats.json';
import useToast from './useToast';
import { useOverlay } from '../contexts/OverlayContext';
import { decimalId, idToPrettyId, prettyIdToIp } from '../lib/hats';

const useHatLinkRequestApprove = ({
  chainId,
  topHatDomain,
  newAdmin,
  eligibility,
  toggle,
  description,
  imageUrl,
}) => {
  const toast = useToast();
  const { handlePendingTx } = useOverlay();

  const { config } = usePrepareContractWrite({
    address: hatsAddresses(chainId),
    chainId,
    abi: JSON.stringify(abi),
    functionName: 'approveLinkTopHatToTree',
    args: [
      topHatDomain,
      decimalId(newAdmin),
      eligibility,
      toggle,
      description,
      imageUrl || '',
    ],
    enabled: !!topHatDomain && !!newAdmin,
  });

  const { writeAsync } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      handlePendingTx({
        hash: _.get(data, 'hash'),
        toastData: {
          title: 'Link Request Approved!',
          description: `Successfully linked top hat ${prettyIdToIp(
            topHatDomain,
          )} to ${prettyIdToIp(idToPrettyId(newAdmin))}`,
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

export default useHatLinkRequestApprove;

import _ from 'lodash';
import { isAddress } from 'viem';
import { useAccount, useEnsAddress } from 'wagmi';

import useHatContractWrite from './useHatContractWrite';

const useTreeCreate = ({
  chainId,
  details,
  receiver,
  overrideReceiver,
  imageUrl,
}: UseTreeCreateProps) => {
  const { address } = useAccount();

  const {
    data: newReceiverResolvedAddress,
    isLoading: isLoadingNewReceiverResolvedAddress,
  } = useEnsAddress({
    name: receiver,
    chainId: 1,
  });

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'mintTopHat',
    args: [
      overrideReceiver ? newReceiverResolvedAddress ?? receiver : address,
      details || '',
      imageUrl || '',
    ],
    chainId,
    onSuccessToastData: {
      title: 'Tree created!',
      description: 'Successfully created tree',
    },
    onErrorToastData: {
      title: 'Error occurred!',
    },
    queryKeys: [['treeList', chainId]],
    transactionTimeout: 4000,
    enabled: isAddress(
      overrideReceiver ? newReceiverResolvedAddress ?? receiver : address || '',
    ),
  });

  return {
    writeAsync,
    isLoading: isLoading || isLoadingNewReceiverResolvedAddress,
  };
};

export default useTreeCreate;

interface UseTreeCreateProps {
  hatsAddress?: `0x${string}`;
  chainId: number;
  details?: string;
  receiver: string;
  overrideReceiver: boolean;
  imageUrl?: string;
}

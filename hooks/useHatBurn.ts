import { useChainId } from 'wagmi';

import useHatContractWrite from '@/hooks/useHatContractWrite';
import { hatIdToHex } from '@/lib/hats';

const useHatBurn = ({
  hatsAddress,
  chainId,
  hatId,
}: {
  hatsAddress?: `0x${string}`;
  chainId: number;
  hatId: string | null;
}) => {
  const currentNetworkId = useChainId();
  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'renounceHat',
    args: [hatId],
    chainId,
    onSuccessToastData: {
      title: 'Hat removed!',
      description: 'Successfully removed hat',
    },
    queryKeys: [
      ['hatDetails', hatIdToHex(hatId)],
      ['treeDetails', hatIdToHex(hatId)],
    ],
    enabled:
      Boolean(hatsAddress) && Boolean(hatId) && chainId === currentNetworkId,
  });

  return { writeAsync, isLoading };
};

export default useHatBurn;

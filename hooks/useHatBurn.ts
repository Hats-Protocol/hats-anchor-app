import { hatIdToHex } from '@/lib/hats';

import useHatContractWrite from './useHatContractWrite';

const useHatBurn = ({
  hatsAddress,
  chainId,
  hatId,
}: {
  hatsAddress?: `0x${string}`;
  chainId: number;
  hatId: string | null;
}) => {
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
    enabled: Boolean(hatsAddress) && Boolean(hatId),
  });

  return { writeAsync, isLoading };
};

export default useHatBurn;

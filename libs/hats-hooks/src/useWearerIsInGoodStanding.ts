import { CONFIG } from '@hatsprotocol/constants';
import { AppHat } from 'types';
import { Hex } from 'viem';
import { useReadContract } from 'wagmi';

const useWearerIsInGoodStanding = ({
  wearer,
  selectedHat,
  chainId,
}: UseWearerIsInGoodStanding) => {
  const hatId = selectedHat?.id || 'none';

  const { data, isLoading } = useReadContract({
    address: CONFIG.hatsAddress,
    abi: CONFIG.hatsAbi,
    chainId,
    functionName: 'isInGoodStanding',
    args: [wearer, hatId],
  });

  return { data, isLoading };
};

export default useWearerIsInGoodStanding;

interface UseWearerIsInGoodStanding {
  wearer: Hex | undefined;
  selectedHat: AppHat | undefined;
  chainId: number | undefined;
}

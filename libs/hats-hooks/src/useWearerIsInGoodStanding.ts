import { CONFIG } from 'app-constants';
import { AppHat } from 'hats-types';
import { Hex, isAddress } from 'viem';
import { useContractRead } from 'wagmi';

const useWearerIsInGoodStanding = ({
  wearer,
  selectedHat,
  chainId,
}: UseWearerIsInGoodStanding) => {
  const hatId = selectedHat?.id || 'none';

  const { data, isLoading } = useContractRead({
    address: CONFIG.hatsAddress,
    abi: CONFIG.hatsAbi,
    chainId,
    functionName: 'isInGoodStanding',
    args: [wearer, hatId],
    enabled: !!wearer && isAddress(wearer) && Boolean(hatId),
  });

  return { data, isLoading };
};

export default useWearerIsInGoodStanding;

interface UseWearerIsInGoodStanding {
  wearer: Hex | undefined;
  selectedHat: AppHat;
  chainId: number;
}

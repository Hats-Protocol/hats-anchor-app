import { isAddress } from 'viem';
import { useContractRead } from 'wagmi';

import CONFIG from '@/constants';
import abi from '@/contracts/Hats.json';

const useWearerIsInGoodStanding = ({
  wearer,
  hatId,
  chainId,
}: UseWearerIsInGoodStanding) => {
  const { data, isLoading } = useContractRead({
    address: CONFIG.hatsAddress,
    abi,
    chainId,
    functionName: 'isInGoodStanding',
    args: [wearer, hatId],
    enabled: Boolean(wearer) && isAddress(wearer) && Boolean(hatId),
  });

  return { data, isLoading };
};

export default useWearerIsInGoodStanding;

interface UseWearerIsInGoodStanding {
  wearer: string;
  hatId: string;
  chainId: number;
}

import { useContractRead } from 'wagmi';

import CONFIG from '@/constants';
import abi from '@/contracts/Hats.json';

const useHatIsInGoodStanding = ({
  wearer,
  hatId,
  chainId,
}: UseHatIsInGoodStanding) => {
  const { data, isLoading } = useContractRead({
    address: CONFIG.hatsAddress,
    abi,
    chainId,
    functionName: 'isInGoodStanding',
    args: [wearer, hatId],
    enabled: Boolean(wearer) && Boolean(hatId),
  });

  return { data, isLoading };
};

export default useHatIsInGoodStanding;

interface UseHatIsInGoodStanding {
  wearer: string;
  hatId: string;
  chainId: number;
}

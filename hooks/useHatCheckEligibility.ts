import { useContractRead } from 'wagmi';

import CONFIG from '@/constants';
import abi from '@/contracts/Hats.json';

const useHatCheckEligibility = ({
  wearer,
  hatId,
  chainId,
}: UseHatCheckEligibilityProps) => {
  const { data, isLoading } = useContractRead({
    address: CONFIG.hatsAddress,
    abi,
    chainId,
    functionName: 'isEligible',
    args: [wearer, hatId],
    enabled: Boolean(wearer) && Boolean(hatId),
  });

  return { data, isLoading };
};

export default useHatCheckEligibility;

interface UseHatCheckEligibilityProps {
  wearer: string;
  hatId?: string;
  chainId: number;
}

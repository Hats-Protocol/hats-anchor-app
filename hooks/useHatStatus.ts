import { useContractRead } from 'wagmi';

import CONFIG from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';

// hats-hooks
const useHatStatus = () => {
  const { chainId, selectedHat } = useTreeForm();

  const hatId = selectedHat?.id || 'none';

  const { data, isLoading } = useContractRead({
    address: CONFIG.hatsAddress,
    abi: CONFIG.hatsAbi,
    chainId,
    functionName: 'isActive',
    args: [hatId],
    enabled: Boolean(hatId) && Boolean(chainId),
  });

  return { data: data as unknown as boolean, isLoading };
};

export default useHatStatus;

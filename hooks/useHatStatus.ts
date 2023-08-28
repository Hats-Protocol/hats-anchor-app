import { useContractRead } from 'wagmi';

import CONFIG from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import abi from '@/contracts/Hats.json';

const useHatStatus = () => {
  const { chainId, selectedHat } = useTreeForm();

  const hatId = selectedHat?.id || 'none';

  const { data, isLoading } = useContractRead({
    address: CONFIG.hatsAddress,
    abi,
    chainId,
    functionName: 'isActive',
    args: [hatId],
    enabled: Boolean(hatId) && Boolean(chainId),
  });

  return { data, isLoading };
};

export default useHatStatus;

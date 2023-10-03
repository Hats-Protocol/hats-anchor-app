import { Hex } from 'viem';
import { useContractRead } from 'wagmi';

import CONFIG from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';

const useIsAdmin = (address: Hex | undefined, hatId?: Hex) => {
  const { selectedHat } = useTreeForm();

  const { data: isAdmin } = useContractRead({
    address: CONFIG.hatsAddress,
    abi: CONFIG.hatsAbi,
    functionName: 'isAdminOfHat',
    args: [address, hatId || selectedHat?.id],
    enabled: !!address && !!selectedHat?.id,
  });

  return isAdmin as boolean | undefined;
};

export default useIsAdmin;

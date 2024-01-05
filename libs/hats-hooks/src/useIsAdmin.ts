import { CONFIG } from 'app-constants';
import { Hex } from 'viem';
import { useContractRead } from 'wagmi';

const useIsAdmin = ({
  address,
  hatId,
  chainId,
}: {
  address: Hex | undefined;
  hatId?: Hex;
  chainId: number | undefined;
}) => {
  const { data: isAdmin } = useContractRead({
    address: CONFIG.hatsAddress,
    abi: CONFIG.hatsAbi,
    chainId,
    functionName: 'isAdminOfHat',
    args: [address, hatId],
    enabled: !!address && !!hatId && !!chainId,
  });

  return isAdmin as boolean | undefined;
};

export default useIsAdmin;

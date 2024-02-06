import { CONFIG } from '@hatsprotocol/constants';
import { Hex } from 'viem';
import { useContractRead } from 'wagmi';

const useIsAdmin = ({
  address,
  hatId,
  chainId,
  editMode,
}: {
  address: Hex | undefined;
  hatId?: Hex;
  chainId: number | undefined;
  editMode?: boolean;
}) => {
  const { data: isAdmin } = useContractRead({
    address: CONFIG.hatsAddress,
    abi: CONFIG.hatsAbi,
    chainId,
    functionName: 'isAdminOfHat',
    args: [address, hatId],
    enabled: !!address && !!hatId && !!chainId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return isAdmin as boolean | undefined;
};

export default useIsAdmin;

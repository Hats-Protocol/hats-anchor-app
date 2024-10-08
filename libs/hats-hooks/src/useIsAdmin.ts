import { CONFIG } from '@hatsprotocol/constants';
import { HATS_ABI } from '@hatsprotocol/sdk-v1-core';
import { Hex } from 'viem';
import { useReadContract } from 'wagmi';

const useIsAdmin = ({
  address,
  hatId,
  chainId,
}: {
  address: Hex | undefined;
  hatId?: Hex;
  chainId: number | undefined;
}) => {
  const { data: isAdmin } = useReadContract({
    address: CONFIG.hatsAddress,
    abi: HATS_ABI,
    chainId,
    functionName: 'isAdminOfHat',
    args: [address || '0x', hatId ? BigInt(hatId) : 0n],
  });

  return isAdmin as boolean | undefined;
};

export default useIsAdmin;

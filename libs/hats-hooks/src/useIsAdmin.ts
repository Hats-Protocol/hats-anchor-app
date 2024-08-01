'use client';

import { CONFIG } from '@hatsprotocol/constants';
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
    abi: CONFIG.hatsAbi,
    chainId,
    functionName: 'isAdminOfHat',
    args: [address, hatId],
  });

  return isAdmin as boolean | undefined;
};

export default useIsAdmin;

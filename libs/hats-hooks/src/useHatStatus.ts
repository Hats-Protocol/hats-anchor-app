'use client';

import { CONFIG } from '@hatsprotocol/constants';
import { AppHat, SupportedChains } from 'types';
import { useReadContract } from 'wagmi';

const useHatStatus = ({
  selectedHat,
  chainId,
}: {
  selectedHat?: AppHat;
  chainId: SupportedChains | undefined;
}) => {
  const hatId = selectedHat?.id || 'none';

  const { data, isLoading } = useReadContract({
    address: CONFIG.hatsAddress,
    abi: CONFIG.hatsAbi,
    chainId,
    functionName: 'isActive',
    args: [hatId],
  });

  return { data: data as unknown as boolean, isLoading };
};

export default useHatStatus;

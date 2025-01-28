import { HATS_ABI, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { AppHat, SupportedChains } from 'types';
import { useReadContract } from 'wagmi';

const useHatStatus = ({ selectedHat, chainId }: UseHatStatusProps) => {
  const hatId = selectedHat?.id || 'none';

  const { data, isLoading } = useReadContract({
    address: HATS_V1,
    abi: HATS_ABI,
    chainId,
    functionName: 'isActive',
    args: [hatId ? BigInt(hatId) : 0n],
  });

  return { data: data as unknown as boolean, isLoading };
};

interface UseHatStatusProps {
  selectedHat?: AppHat;
  chainId: SupportedChains | undefined;
}

export { useHatStatus, type UseHatStatusProps };

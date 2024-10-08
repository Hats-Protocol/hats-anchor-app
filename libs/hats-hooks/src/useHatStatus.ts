import { CONFIG } from '@hatsprotocol/constants';
import { HATS_ABI } from '@hatsprotocol/sdk-v1-core';
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
    abi: HATS_ABI,
    chainId,
    functionName: 'isActive',
    args: [hatId ? BigInt(hatId) : 0n],
  });

  return { data: data as unknown as boolean, isLoading };
};

export default useHatStatus;

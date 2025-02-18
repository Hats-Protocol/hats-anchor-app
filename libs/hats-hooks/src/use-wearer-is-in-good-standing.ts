import { HATS_ABI, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { get } from 'lodash';
import { AppHat } from 'types';
import { Hex } from 'viem';
import { useReadContract } from 'wagmi';

const useWearerIsInGoodStanding = ({ wearer, selectedHat, chainId }: UseWearerIsInGoodStanding) => {
  const hatId: string = get(selectedHat, 'id', 'none');

  const { data, isLoading } = useReadContract({
    address: HATS_V1,
    abi: HATS_ABI,
    chainId,
    functionName: 'isInGoodStanding',
    args: [wearer || '0x', hatId ? BigInt(hatId) : 0n],
  });

  return { data, isLoading };
};

interface UseWearerIsInGoodStanding {
  wearer: Hex | undefined;
  selectedHat?: AppHat;
  chainId: number | undefined;
}

export { useWearerIsInGoodStanding };

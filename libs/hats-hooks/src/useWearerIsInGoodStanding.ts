import { CONFIG } from '@hatsprotocol/constants';
import { HATS_ABI } from '@hatsprotocol/sdk-v1-core';
import { get } from 'lodash';
import { AppHat } from 'types';
import { Hex } from 'viem';
import { useReadContract } from 'wagmi';

const useWearerIsInGoodStanding = ({
  wearer,
  selectedHat,
  chainId,
}: UseWearerIsInGoodStanding) => {
  const hatId: string = get(selectedHat, 'id', 'none');

  const { data, isLoading } = useReadContract({
    address: CONFIG.hatsAddress,
    abi: HATS_ABI,
    chainId,
    functionName: 'isInGoodStanding',
    args: [wearer || '0x', hatId ? BigInt(hatId) : 0n],
  });

  return { data, isLoading };
};

export default useWearerIsInGoodStanding;

interface UseWearerIsInGoodStanding {
  wearer: Hex | undefined;
  selectedHat?: AppHat;
  chainId: number | undefined;
}

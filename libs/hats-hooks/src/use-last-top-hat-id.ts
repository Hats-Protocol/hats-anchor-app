import { HATS_ABI, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useQuery } from '@tanstack/react-query';
import { toNumber } from 'lodash';
import { viemPublicClient } from 'utils';

const getLastTopHatId = async (chainId: number | undefined) => {
  if (!chainId) return null;
  const viemClient = viemPublicClient(chainId);
  const lastTopHatId = await viemClient.readContract({
    address: HATS_V1,
    abi: HATS_ABI,
    functionName: 'lastTopHatId',
    args: [],
  });

  return toNumber(lastTopHatId) || null;
};

const useLastTopHatId = ({ chainId }: { chainId: number | undefined }) => {
  return useQuery({
    queryKey: ['lastTopHatId', { chainId }],
    queryFn: () => getLastTopHatId(chainId),
    enabled: !!chainId,
  });
};

export { useLastTopHatId };

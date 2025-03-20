import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { getOffchainCouncilData } from 'utils';
import { Hex } from 'viem';

const useOffchainCouncilDetails = ({
  hsg,
  chainId,
  enabled,
}: {
  hsg: Hex | undefined;
  chainId: number | undefined;
  enabled?: boolean;
}) => {
  const { getAccessToken } = usePrivy();
  return useQuery({
    queryKey: ['offchainCouncilData', { chainId, hsg }],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return getOffchainCouncilData({ hsg, chainId, accessToken });
    },
    enabled: (enabled === undefined ? true : enabled) && !!hsg && !!chainId,
  });
};

export { useOffchainCouncilDetails };

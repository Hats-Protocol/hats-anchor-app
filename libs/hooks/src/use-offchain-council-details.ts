import { useQuery } from '@tanstack/react-query';
import { getOffchainCouncilData } from 'utils';
import { Hex } from 'viem';
const useOffchainCouncilDetails = ({ hsg, chainId }: { hsg: Hex | undefined; chainId: number | undefined }) => {
  return useQuery({
    queryKey: ['offchainCouncilData', { chainId, hsg }],
    queryFn: () => getOffchainCouncilData({ hsg, chainId }),
    enabled: !!hsg && !!chainId,
  });
};

export { useOffchainCouncilDetails };

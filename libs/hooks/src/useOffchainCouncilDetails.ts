import { useQuery } from '@tanstack/react-query';
import { getOffchainCouncilData } from 'utils';

export const useOffchainCouncilDetails = ({ hsg, chainId }: { hsg: string; chainId: number }) => {
  return useQuery({
    queryKey: ['offchainCouncilData', { chainId, hsg }],
    queryFn: () => getOffchainCouncilData({ hsg, chainId }),
    enabled: !!hsg && !!chainId,
  });
};

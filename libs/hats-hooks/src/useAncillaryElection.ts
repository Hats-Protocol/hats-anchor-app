import { useQuery } from '@tanstack/react-query';
import { fetchElectionData } from 'app-utils';
import { SupportedChains } from 'hats-types';

const useAncillaryElection = ({
  id,
  chainId,
}: {
  id?: string;
  chainId: SupportedChains;
}) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['electionData', id, chainId],
    queryFn: () => fetchElectionData(id || 'none', chainId),
    enabled: !!id && !!chainId,
  });

  return {
    data,
    error,
    isLoading,
  };
};

export default useAncillaryElection;

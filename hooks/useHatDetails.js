import { useQuery } from '@tanstack/react-query';
import { fetchHatDetails } from '@/gql/helpers';
import { hatIdToHex } from '@/lib/hats';

const useHatDetails = ({ hatId, chainId }) => {
  const hexId = hatIdToHex(hatId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetails', hexId, chainId],
    queryFn: () => fetchHatDetails(hexId, chainId),
    enabled: !!hatId,
  });

  return { data, isLoading, error };
};

export default useHatDetails;

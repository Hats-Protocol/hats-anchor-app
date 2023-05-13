import { useQuery } from '@tanstack/react-query';
import { fetchHatDetails } from '../gql/helpers';
import { hatIdToHex } from '../lib/hats';

const useHatDetails = ({ hatId, chainId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetails', hatId],
    queryFn: () => fetchHatDetails(hatId, chainId),
    enabled: !!hatId,
  });

  return { data, isLoading, error };
};

export default useHatDetails;

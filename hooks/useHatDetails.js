import { useQuery } from '@tanstack/react-query';
import { fetchHatDetails } from '../gql/helpers';

const useHatDetails = ({ hatId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetails', hatId],
    queryFn: () => fetchHatDetails(hatId),
    enabled: !!hatId,
  });

  return { data, isLoading, error };
};

export default useHatDetails;

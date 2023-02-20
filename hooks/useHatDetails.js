import { useQuery } from '@tanstack/react-query';
import { fetchHatDetails } from '../gql/helpers';
import { hatIdToHex } from '../lib/hats';

const useHatDetails = ({ hatId }) => {
  const hexId = hatIdToHex(hatId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetails', hexId],
    queryFn: () => fetchHatDetails(hexId),
    enabled: !!hatId,
  });

  return { data, isLoading, error };
};

export default useHatDetails;

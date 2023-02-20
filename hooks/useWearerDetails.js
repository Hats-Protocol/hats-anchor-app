import { useQuery } from '@tanstack/react-query';
import { fetchWearerDetails } from '../gql/helpers';

const useWearerDetails = ({ wearerAddress, chainId, initialData }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['wearerDetails', wearerAddress],
    queryFn: () => fetchWearerDetails(wearerAddress, chainId),
    enabled: !!wearerAddress && !!chainId,
    initialData,
  });

  return { data, isLoading, error };
};

export default useWearerDetails;

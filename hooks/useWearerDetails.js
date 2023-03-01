import { useQuery } from '@tanstack/react-query';
import { fetchAllWearerDetails } from '../gql/helpers';

const useWearerDetails = ({ wearerAddress, initialData }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['wearerDetails', wearerAddress],
    queryFn: () => fetchAllWearerDetails(wearerAddress),
    enabled: !!wearerAddress,
    initialData,
  });

  return { data, isLoading, error };
};

export default useWearerDetails;

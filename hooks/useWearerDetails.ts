import { useQuery } from '@tanstack/react-query';

import { fetchWearerDetails } from '@/gql/helpers';

const useWearerDetails = ({
  wearerAddress,
  chainId,
  initialData,
}: UseWearerDetailsProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['wearerDetails', wearerAddress, chainId],
    queryFn: () => fetchWearerDetails(wearerAddress, chainId),
    enabled: !!wearerAddress && !!chainId,
    initialData,
  });

  return { data, isLoading, error };
};

export default useWearerDetails;

interface UseWearerDetailsProps {
  wearerAddress: `0x${string}` | undefined;
  chainId: number;
  initialData?: any;
}

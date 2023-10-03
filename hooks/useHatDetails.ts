import { useQuery } from '@tanstack/react-query';

import { ZERO_ID } from '@/constants';
import { fetchHatDetails } from '@/gql/helpers';
import { Hat } from '@/types';

const useHatDetails = ({
  hatId,
  chainId,
  initialData,
}: {
  hatId: string | undefined;
  chainId: number;
  initialData?: Hat | null;
}): {
  data: Hat | undefined | null;
  isLoading: boolean;
  error: unknown | null;
} => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetails', { id: hatId, chainId }],
    queryFn: () => fetchHatDetails(hatId, chainId),
    enabled: !!hatId && hatId !== ZERO_ID && !!chainId,
    initialData,
  });

  return { data, isLoading, error };
};

export default useHatDetails;

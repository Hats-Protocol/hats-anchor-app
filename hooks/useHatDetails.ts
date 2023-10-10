import { useQuery } from '@tanstack/react-query';

import { ZERO_ID } from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { fetchHatDetails } from '@/gql/helpers';
import { Hat } from '@/types';

const useHatDetails = ({
  hatId,
  initialData,
}: {
  hatId: string | undefined;
  initialData?: Hat | null;
}): {
  data: Hat | undefined | null;
  isLoading: boolean;
  error: unknown | null;
} => {
  const { chainId } = useTreeForm();
  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetails', { id: hatId, chainId }],
    queryFn: () => fetchHatDetails(hatId, chainId),
    enabled: !!hatId && hatId !== ZERO_ID && !!chainId,
    initialData,
  });

  return { data, isLoading, error };
};

export default useHatDetails;

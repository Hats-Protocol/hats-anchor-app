import { useQuery } from '@tanstack/react-query';
import { ZERO_ID } from 'app-utils';
import { Hat } from 'hats-types';

import { useTreeForm } from '../contexts/TreeFormContext';
import { fetchHatDetails } from '../lib/subgraph/hat';

// hats-hooks
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
    // why is hatId getting set to undefined string?
    enabled: !!hatId && hatId !== ZERO_ID && hatId !== 'undefined' && !!chainId,
    initialData,
  });

  return { data, isLoading, error };
};

export default useHatDetails;

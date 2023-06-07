import { useQuery } from '@tanstack/react-query';

import { fetchHatDetails } from '@/gql/helpers';
import { hatIdToHex } from '@/lib/hats';

const useHatDetails = ({
  hatId,
  chainId,
}: {
  hatId: string | undefined;
  chainId: number;
}): { data: any; isLoading: boolean; error: any } => {
  if (!hatId) return { data: null, isLoading: false, error: null };
  const hexId = hatIdToHex(hatId);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetails', hexId, chainId],
    queryFn: () => fetchHatDetails(hexId, chainId),
    enabled: !!hatId,
  });

  return { data, isLoading, error };
};

export default useHatDetails;

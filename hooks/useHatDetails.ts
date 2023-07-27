import { useQuery } from '@tanstack/react-query';

import { fetchHatDetails } from '@/gql/helpers';
import { hatIdToHex } from '@/lib/hats';
import { IHat } from '@/types';

const useHatDetails = ({
  hatId,
  chainId,
}: {
  hatId: string | undefined;
  chainId: number;
}): {
  data: IHat | undefined | null;
  isLoading: boolean;
  error: unknown | null;
} => {
  const hexId = hatId && hatIdToHex(hatId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetails', hexId, chainId],
    queryFn: () => fetchHatDetails(hexId, chainId),
    enabled: !!hexId,
  });

  return { data, isLoading, error };
};

export default useHatDetails;

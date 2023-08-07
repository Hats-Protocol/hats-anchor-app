import { useQuery } from '@tanstack/react-query';

import { fetchHatDetails } from '@/gql/helpers';
import { IHat } from '@/types';

const ZERO_HEX =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

const useHatDetails = ({
  hatId,
  chainId,
  initialData,
}: {
  hatId: string | undefined;
  chainId: number;
  initialData?: IHat | null;
}): {
  data: IHat | undefined | null;
  isLoading: boolean;
  error: unknown | null;
} => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetails', hatId, chainId],
    queryFn: () => fetchHatDetails(hatId, chainId),
    enabled: !!hatId && hatId !== ZERO_HEX && !!chainId,
    initialData,
  });

  return { data, isLoading, error };
};

export default useHatDetails;

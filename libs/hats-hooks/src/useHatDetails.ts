import { useQuery } from '@tanstack/react-query';
import { ZERO_ID } from 'app-constants';
import { fetchHatDetails } from 'app-utils';
import { AppHat, SupportedChains } from 'hats-types';

const useHatDetails = ({
  hatId,
  chainId,
  initialData,
}: {
  hatId: string | undefined;
  chainId: SupportedChains | undefined;
  initialData?: AppHat | null;
}): {
  data: AppHat | undefined | null;
  isLoading: boolean;
  error: unknown | null;
} => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetails', { id: hatId, chainId }],
    queryFn: () => fetchHatDetails(hatId, chainId),
    // ? why is hatId getting set to undefined string?
    enabled: !!hatId && hatId !== ZERO_ID && hatId !== 'undefined' && !!chainId,
    initialData,
  });

  return { data, isLoading, error };
};

export default useHatDetails;

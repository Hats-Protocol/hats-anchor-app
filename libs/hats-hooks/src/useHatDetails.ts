import { ZERO_ID } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import { fetchHatDetails } from 'app-utils';
import { AppHat, SupportedChains } from 'hats-types';

const useHatDetails = ({
  hatId,
  chainId,
  initialData,
  editMode,
}: {
  hatId: string | undefined;
  chainId: SupportedChains | undefined;
  initialData?: AppHat | null;
  editMode?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetails', { id: hatId, chainId }],
    queryFn: () => fetchHatDetails(hatId, chainId),
    // ? why is hatId getting set to undefined string?
    enabled: !!hatId && hatId !== ZERO_ID && hatId !== 'undefined' && !!chainId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
    initialData,
  });

  return { data, isLoading, error };
};

export default useHatDetails;

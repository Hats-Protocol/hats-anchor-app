import { useQuery } from '@tanstack/react-query';
import { AppHat } from 'types';
import { fetchHatWearerDetails } from 'utils';

const useHatWearers = ({
  hat,
  chainId,
  editMode,
}: {
  hat: AppHat;
  chainId: number;
  editMode?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hatWearers', hat, chainId],
    queryFn: () => fetchHatWearerDetails(hat, chainId),
    staleTime: editMode ? Infinity : 15 * 1000 * 60,
  });

  return { data, isLoading, error };
};

export default useHatWearers;

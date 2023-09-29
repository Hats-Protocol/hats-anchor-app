import { useQuery } from '@tanstack/react-query';

import { fetchTreeDetails } from '@/gql/helpers';
import { Tree } from '@/types';

const useTreeDetails = ({
  treeId,
  chainId,
  initialData,
}: UseTreeDetailsProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['treeDetails', treeId, chainId],
    queryFn: () => fetchTreeDetails(treeId, chainId),
    enabled: !!treeId,
    initialData,
  });

  return { data, isLoading, error };
};

export default useTreeDetails;

interface UseTreeDetailsProps {
  treeId: string;
  chainId: number;
  initialData?: Tree | null;
}

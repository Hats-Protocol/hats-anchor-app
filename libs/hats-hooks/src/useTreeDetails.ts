import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useQuery } from '@tanstack/react-query';
import { fetchTreeDetails } from 'utils';

// hats-hooks
const useTreeDetails = ({
  treeId,
  chainId,
  initialData,
  editMode,
}: UseTreeDetailsProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['treeDetails', treeId, chainId],
    queryFn: () => fetchTreeDetails(treeId, chainId),
    enabled: !!treeId,
    initialData,
    refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return { data, isLoading, error };
};

export default useTreeDetails;

interface UseTreeDetailsProps {
  treeId: string;
  chainId: number;
  initialData?: Tree | null;
  editMode?: boolean;
}

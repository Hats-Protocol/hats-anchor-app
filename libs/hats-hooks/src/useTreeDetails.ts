import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useQuery } from '@tanstack/react-query';
import { fetchTreeDetails } from 'utils';
import { numberToHex } from 'viem';

// hats-hooks
const useTreeDetails = ({
  treeId,
  chainId,
  initialData,
  editMode,
}: UseTreeDetailsProps) => {
  const localTreeId = numberToHex(treeId, { size: 8 });

  const { data, isLoading, error } = useQuery({
    queryKey: ['treeDetails', localTreeId, chainId],
    queryFn: () => fetchTreeDetails(localTreeId, chainId),
    enabled: !!localTreeId,
    initialData,
    refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return { data, isLoading, error };
};

export default useTreeDetails;

interface UseTreeDetailsProps {
  treeId: number;
  chainId: number;
  initialData?: Tree | null;
  editMode?: boolean;
}

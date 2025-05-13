import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useQuery } from '@tanstack/react-query';
import { fetchTreeDetailsMesh } from 'utils';
import { numberToHex } from 'viem';

const useTreeDetails = ({ treeId, chainId, initialData, editMode, enabled = true }: UseTreeDetailsProps) => {
  const localTreeId = treeId ? numberToHex(treeId, { size: 8 }) : undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ['treeDetails', localTreeId, chainId],
    queryFn: () => (chainId ? fetchTreeDetailsMesh(localTreeId, chainId) : undefined),
    enabled: !!treeId && !!chainId && !!enabled,
    initialData,
    refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return { data, isLoading, error: error as Error };
};

interface UseTreeDetailsProps {
  treeId: number | undefined;
  chainId: number | undefined;
  initialData?: Tree | null;
  editMode?: boolean;
  enabled?: boolean;
}

export { useTreeDetails };

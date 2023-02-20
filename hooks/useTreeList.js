import { useQuery } from '@tanstack/react-query';
import { fetchAllTrees } from '../gql/helpers';

const useTreeList = ({ chainId, initialData }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['treeList'],
    queryFn: () => fetchAllTrees(chainId),
    enabled: !!chainId,
    initialData,
  });

  return { data, isLoading, error };
};

export default useTreeList;

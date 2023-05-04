import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedTrees } from '../gql/helpers';

const usePaginatedTreeList = ({ chainId, initialData, perPage = 20, page }) => {
  const {
    data: trees,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['treeList', chainId, page, perPage],
    queryFn: () => fetchPaginatedTrees(chainId, page, perPage),
    enabled: !!chainId,
    initialData,
  });

  return {
    trees,
    isLoading,
    error,
    page,
  };
};

export default usePaginatedTreeList;

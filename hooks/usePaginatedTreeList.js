import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedTrees } from '../gql/helpers';

const usePaginatedTreeList = ({ chainId, initialData, perPage = 20, page }) => {
  const {
    data: newTrees,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['treeList', chainId, page, perPage],
    queryFn: () => fetchPaginatedTrees(chainId, page, perPage),
    enabled: !!chainId,
    initialData,
  });

  const [trees, setTrees] = useState(initialData || []);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (newTrees) {
      setTrees((prevTrees) => [...prevTrees, ...newTrees]);
      if (newTrees.length < perPage) {
        setHasMore(false);
      }
    }
  }, [newTrees, perPage, page]);

  return { trees, isLoading, error, hasMore };
};

export default usePaginatedTreeList;

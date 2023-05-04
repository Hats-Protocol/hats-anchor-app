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

  useEffect(() => {
    if (newTrees) {
      setTrees((prevTrees) => [...prevTrees, ...newTrees]);
    }
  }, [newTrees]);

  return { trees, isLoading, error };
};

export default usePaginatedTreeList;

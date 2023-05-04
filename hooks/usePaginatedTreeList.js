import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedTrees } from '../gql/helpers';

const usePaginatedTreeList = ({ chainId, perPage = 20, page }) => {
  const {
    data: newTrees,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['treeList', chainId, page, perPage],
    queryFn: () => fetchPaginatedTrees(chainId, page, perPage),
    enabled: !!chainId,
  });

  const [trees, setTrees] = useState([]);
  const [prevChainId, setPrevChainId] = useState(null);
  const fetchedTreeIds = useRef([]);

  useEffect(() => {
    if (chainId !== prevChainId) {
      setTrees(undefined);
      fetchedTreeIds.current = [];
    }
    setPrevChainId(chainId);
  }, [chainId, prevChainId]);

  useEffect(() => {
    if (newTrees) {
      const newTreesToAdd = newTrees.filter(
        (tree) => !fetchedTreeIds.current.includes(tree.id),
      );
      fetchedTreeIds.current = [
        ...fetchedTreeIds.current,
        ...newTreesToAdd.map((tree) => tree.id),
      ];
      setTrees((prevTrees) => [...(prevTrees || []), ...newTreesToAdd]);
    }
  }, [newTrees]);

  return { trees, isLoading, error };
};

export default usePaginatedTreeList;

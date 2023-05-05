import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedTrees } from '../gql/helpers';

const usePaginatedTreeList = ({
  chainId,
  perPage = 20,
  page,
  setIsEnd,
  isEnd,
  initialData,
}) => {
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
      if (newTreesToAdd.length === 0 || newTreesToAdd.length < perPage) {
        // can be refactored once we can fetch the data about # of trees
        setIsEnd(true);
      }
      setTrees((prevTrees) => [...(prevTrees || []), ...newTreesToAdd]);
    }
  }, [newTrees, perPage, setIsEnd]);

  return { trees, isLoading, error, isEnd };
};

export default usePaginatedTreeList;

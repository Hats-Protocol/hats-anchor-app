import { useState, useEffect } from 'react';
import usePaginatedTreeList from './usePaginatedTreeList';

const useFetchMoreTrees = (chainId, page) => {
  const {
    trees: newTrees,
    isLoading,
    error,
  } = usePaginatedTreeList({
    chainId,
    perPage: 20,
    page,
  });

  const [trees, setTrees] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (newTrees) {
      setTrees((prevTrees) => [...prevTrees, ...newTrees]);
      if (newTrees.length < 20) {
        setHasMore(false);
      }
    }
  }, [newTrees]);

  return { trees, isLoading, error, hasMore };
};

export default useFetchMoreTrees;

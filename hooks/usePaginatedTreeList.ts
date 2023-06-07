import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchPaginatedTrees } from '@/gql/helpers';

const usePaginatedTreeList = ({
  chainId,
  perPage = 20,
  initialData,
}: UsePaginatedTreeListProps) => {
  const {
    data: trees,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ['treeList', chainId],
    getNextPageParam: (_, allPages) =>
      allPages ? allPages.length + 1 : undefined,
    queryFn: ({ pageParam = 1 }) =>
      fetchPaginatedTrees(chainId, pageParam, perPage),
    initialData,
  });

  return {
    trees,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
};

export default usePaginatedTreeList;

interface UsePaginatedTreeListProps {
  chainId: number;
  perPage?: number;
  initialData?: any;
}

import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { fetchPaginatedTrees } from '@/gql/helpers';
import { ITree } from '@/types';

const usePaginatedTreeList = ({
  chainId,
  perPage = 40,
  initialData,
}: UsePaginatedTreeListProps) => {
  const {
    data,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ['treeList', chainId, perPage],
    getNextPageParam: (returnData: any, allPages: any) => {
      return returnData.length === perPage ? allPages.length : undefined;
    },
    queryFn: ({ pageParam = 0 }) =>
      fetchPaginatedTrees(chainId, pageParam, perPage),
    initialData: () => initialData,
  });

  return {
    data,
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
  initialData?: InfiniteData<ITree[]>;
}

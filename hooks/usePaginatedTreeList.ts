import { useInfiniteQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { fetchPaginatedTrees } from '@/gql/helpers';
import { Tree } from '@/types';

// hats-hooks
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
    getNextPageParam: (
      returnData: Tree[] | undefined,
      allPages: (Tree[] | undefined)[],
    ) => {
      return _.eq(_.size(returnData), perPage) ? _.size(allPages) : undefined;
    },
    queryFn: ({ pageParam = 0 }) =>
      fetchPaginatedTrees(chainId, pageParam, perPage),
    initialData: { pages: [initialData], pageParams: [0] },
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
  initialData?: Tree[];
}

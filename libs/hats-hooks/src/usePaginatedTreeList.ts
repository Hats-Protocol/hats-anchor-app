'use client';

import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useInfiniteQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { fetchPaginatedTrees } from 'utils';

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
    queryFn: ({ pageParam }) =>
      fetchPaginatedTrees(chainId, pageParam, perPage),
    initialPageParam: 0,
    initialData: initialData
      ? { pages: [initialData], pageParams: [0] }
      : undefined,
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

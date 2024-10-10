import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useInfiniteQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { fetchPaginatedTreesMesh } from 'utils';

const usePaginatedTreeList = ({
  chainId,
  perPage = 40,
  enabled = true,
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
      fetchPaginatedTreesMesh(chainId, pageParam, perPage),
    initialPageParam: 0,
    initialData: initialData
      ? { pages: [initialData], pageParams: [0] }
      : undefined,
    enabled,
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
  enabled?: boolean;
  initialData?: Tree[];
}

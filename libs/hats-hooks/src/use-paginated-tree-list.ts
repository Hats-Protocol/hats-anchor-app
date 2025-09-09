import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useInfiniteQuery } from '@tanstack/react-query';
import { eq, size } from 'lodash';
import { fetchPaginatedTreesMesh } from 'utils';

const usePaginatedTreeList = ({ chainId, perPage = 40, enabled = true, initialData }: UsePaginatedTreeListProps) => {
  const { data, fetchNextPage, isLoading, hasNextPage, isFetchingNextPage, error } = useInfiniteQuery({
    queryKey: ['treeList', chainId, perPage],
    queryFn: ({ pageParam }) => fetchPaginatedTreesMesh(chainId, pageParam, perPage),
    getNextPageParam: (returnData: Tree[] | undefined, allPages: (Tree[] | undefined)[]) => {
      return eq(size(returnData), perPage) ? size(allPages) : undefined;
    },
    initialPageParam: 0,
    initialData: initialData ? { pages: [initialData], pageParams: [0] } : undefined,
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

interface UsePaginatedTreeListProps {
  chainId: number;
  perPage?: number;
  enabled?: boolean;
  initialData?: Tree[];
}

export { usePaginatedTreeList };

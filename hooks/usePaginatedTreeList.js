import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchPaginatedTrees } from '@/gql/helpers';

const usePaginatedTreeList = ({ chainId, perPage = 20, initialData }) => {
  const { data, fetchNextPage, isLoading, isFetchingNextPage, error } =
    useInfiniteQuery(
      ['treeList', chainId],
      {
        getNextPageParam: (_, allPages) =>
          allPages ? allPages.length + 1 : undefined,
        queryFn: ({ pageParam = 1 }) =>
          fetchPaginatedTrees(chainId, pageParam, perPage),
      },
      initialData,
    );

  const trees = data?.pages.flatMap((page) => [...page]) || [];
  const lastPage = data?.pages[data.pages.length - 1];
  const isEnd = lastPage && lastPage.length < perPage;

  return { trees, isLoading, error, isEnd, fetchNextPage, isFetchingNextPage };
};

export default usePaginatedTreeList;

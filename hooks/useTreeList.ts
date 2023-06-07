import { useQuery } from '@tanstack/react-query';

import { fetchAllTrees } from '@/gql/helpers';

const useTreeList = ({
  chainId,
  initialData,
}: {
  chainId: number;
  initialData: any;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['treeList', chainId],
    queryFn: () => fetchAllTrees(chainId),
    enabled: !!chainId,
    initialData,
  });

  return { data, isLoading, error };
};

export default useTreeList;

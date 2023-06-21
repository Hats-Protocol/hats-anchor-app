import { useQuery } from '@tanstack/react-query';

import { fetchAllTrees } from '@/gql/helpers';
import { ITree } from '@/types';

const useTreeList = ({
  chainId,
  initialData,
}: {
  chainId: number;
  initialData: ITree[] | null;
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

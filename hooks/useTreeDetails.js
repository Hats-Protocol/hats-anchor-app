import { useQuery } from '@tanstack/react-query';
import { fetchTreeDetails } from '../gql/helpers';

const useTreeDetails = ({ treeId, chainId, initialData }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['treeDetails', treeId],
    queryFn: () => fetchTreeDetails(treeId, chainId),
    enabled: !!treeId,
    initialData,
  });

  return { data, isLoading, error };
};

export default useTreeDetails;

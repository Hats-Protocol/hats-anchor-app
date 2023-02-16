import { useQuery } from '@tanstack/react-query';
import client from '../gql/client';
import { GET_TREE } from '../gql/queries';

const useTreeDetails = ({ treeId, chainId }) => {
  const fetchTreeDetails = async () =>
    client(chainId).request(GET_TREE, { id: treeId });

  const { data, isLoading, error } = useQuery({
    queryKey: ['treeDetails', treeId],
    queryFn: fetchTreeDetails,
    enabled: !!treeId,
  });

  return { data, isLoading, error };
};

export default useTreeDetails;

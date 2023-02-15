import { useQuery } from '@tanstack/react-query';
import client from '../gql/client';
import { GET_HAT } from '../gql/queries';

const useHatDetails = ({ hatId }) => {
  const fetchTreeDetails = async () => client().request(GET_HAT, { id: hatId });

  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetails', hatId],
    queryFn: fetchTreeDetails,
    enabled: !!hatId,
  });

  return { data, isLoading, error };
};

export default useHatDetails;

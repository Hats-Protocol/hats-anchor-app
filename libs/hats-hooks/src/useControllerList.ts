import { useQuery } from '@tanstack/react-query';
import { fetchControllersForUser } from 'app-utils';

const useControllerList = ({ address }: { address: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['controllerList', address],
    queryFn: () => fetchControllersForUser(address),
    enabled: !!address,
  });

  return { data, isLoading };
};

export default useControllerList;

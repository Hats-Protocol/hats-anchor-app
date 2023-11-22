import { useQuery } from '@tanstack/react-query';

import { fetchControllersForUser } from '@/lib/subgraph/wearer';

// hats-hooks
const useControllerList = ({ address }: { address: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['controllerList', address],
    queryFn: () => fetchControllersForUser(address),
    enabled: !!address,
  });

  return { data, isLoading };
};

export default useControllerList;

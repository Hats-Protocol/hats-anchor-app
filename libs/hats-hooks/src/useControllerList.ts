'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchControllersForUser } from 'utils';

const useControllerList = ({ address }: { address: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['controllerList', address],
    queryFn: () => fetchControllersForUser(address),
    enabled: !!address,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  return { data, isLoading };
};

export default useControllerList;

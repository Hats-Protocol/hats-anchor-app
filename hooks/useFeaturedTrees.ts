import { useQuery } from '@tanstack/react-query';

import { featuredTrees } from '@/constants';

const useFeaturedTrees = () => {
  const returnFeaturedTrees = () => featuredTrees;

  const { data, isLoading } = useQuery({
    queryKey: ['featuredTrees'],
    queryFn: returnFeaturedTrees,
    staleTime: 1_000_000,
  });

  return { data, isLoading };
};

export default useFeaturedTrees;

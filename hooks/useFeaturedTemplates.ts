import { useQuery } from '@tanstack/react-query';

import { featuredTemplates } from '@/constants';

// app-hooks
const useFeaturedTemplates = () => {
  const returnFeaturedTemplates = () => featuredTemplates;

  const { data, isLoading } = useQuery({
    queryKey: ['featuredTemplates'],
    queryFn: returnFeaturedTemplates,
    staleTime: 1_000_000,
  });

  return { data, isLoading };
};

export default useFeaturedTemplates;

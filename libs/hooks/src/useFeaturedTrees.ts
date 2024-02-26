import { FEATURED_TREES } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import { ipfsUrl } from 'utils';

// hooks
const useFeaturedTrees = () => {
  const returnFeaturedTrees = () => FEATURED_TREES({ ipfsUrl });

  const { data, isLoading } = useQuery({
    queryKey: ['featuredTrees'],
    queryFn: returnFeaturedTrees,
    staleTime: 1_000_000,
  });

  return { data, isLoading };
};

export default useFeaturedTrees;

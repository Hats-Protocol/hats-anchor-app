import { useQuery } from '@tanstack/react-query';
import { FEATURED_TEMPLATES } from '@hatsprotocol/constants';
import { ipfsUrl } from 'app-utils';

// app-hooks
const useFeaturedTemplates = () => {
  const returnFeaturedTemplates = () => FEATURED_TEMPLATES({ ipfsUrl });

  const { data, isLoading } = useQuery({
    queryKey: ['featuredTemplates'],
    queryFn: returnFeaturedTemplates,
    staleTime: 1_000_000,
  });

  return { data, isLoading };
};

export default useFeaturedTemplates;

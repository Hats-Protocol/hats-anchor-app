import { useQuery } from '@tanstack/react-query';
import { fetchAncillaryModules } from 'app-utils';

const useAncillaryModules = ({ id }: { id?: string }) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['ancillaryModules', id],
    queryFn: () => fetchAncillaryModules(id),
    enabled: !!id,
  });

  return {
    hatAuthority: data?.hatAuthority,
    error,
    isLoading,
  };
};

export default useAncillaryModules;

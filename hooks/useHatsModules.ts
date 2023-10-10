import { useQuery } from '@tanstack/react-query';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { createHatsModulesClient } from '@/lib/web3';

const useHatsModules = () => {
  const { chainId } = useTreeForm();

  const fetchModules = async () => {
    const hatsClient = await createHatsModulesClient(chainId);
    if (!hatsClient) {
      throw new Error('Unable to initialize hatsClient');
    }

    return hatsClient.getAllModules();
  };

  const {
    data: modules,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['hatsModules', chainId],
    queryFn: fetchModules,
    enabled: !!chainId,
  });

  return { modules, isLoading, isError, error };
};

export default useHatsModules;

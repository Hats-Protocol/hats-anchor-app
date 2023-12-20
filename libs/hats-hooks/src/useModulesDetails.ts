import { useQuery } from '@tanstack/react-query';
import { createHatsModulesClient } from 'app-utils';
import { ModuleDetails, SupportedChains } from 'hats-types';
import { Hex } from 'viem';

const useModulesDetails = ({
  moduleIds,
  chainId,
}: {
  moduleIds: Hex[];
  chainId: SupportedChains | undefined;
}) => {
  const fetchModulesData = async () => {
    if (!chainId || moduleIds.length === 0) {
      return [];
    }
    const moduleClient = await createHatsModulesClient(chainId);
    if (!moduleClient) return [];

    const result = await moduleClient.getModulesByInstances(moduleIds);

    return result;
  };

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['modulesDetails', moduleIds, chainId],
    queryFn: fetchModulesData,
    enabled: !!chainId,
  });

  return {
    modulesDetails: isSuccess ? (data as ModuleDetails[]) : [],
    isLoading: isLoading && !isSuccess,
  };
};

export default useModulesDetails;

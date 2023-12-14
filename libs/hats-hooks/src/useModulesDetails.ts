import { useQuery } from '@tanstack/react-query';
import { createHatsModulesClient } from 'app-utils';
import { ModuleDetails, SupportedChains } from 'hats-types';
import _ from 'lodash';
import { Hex } from 'viem';

const useModulesDetails = ({
  moduleIds,
  chainId,
}: {
  moduleIds: Hex[];
  chainId: SupportedChains | undefined;
}) => {
  const fetchModulesData = async () => {
    const moduleClient = await createHatsModulesClient(chainId);
    if (!moduleClient) return [];

    const modules = await moduleClient.getModulesByInstances(moduleIds);
    return modules;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['modulesDetails', moduleIds],
    queryFn: fetchModulesData,
    enabled: !!chainId && !_.isEmpty(moduleIds),
  });

  return {
    modulesDetails: data as ModuleDetails[],
    isLoading,
  };
};

export default useModulesDetails;

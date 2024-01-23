import { Module } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { createHatsModulesClient } from 'app-utils';
import { ModuleDetails, SupportedChains } from 'hats-types';
import _ from 'lodash';
import { Hex } from 'viem';

const useModulesDetails = ({
  moduleIds,
  chainId,
}: {
  moduleIds: Hex[] | null;
  chainId: SupportedChains | undefined;
}) => {
  const fetchModulesData = async () => {
    if (!chainId || !moduleIds) {
      return [];
    }
    const moduleClient = await createHatsModulesClient(chainId);
    if (!moduleClient) return [];

    const result = await moduleClient.getModulesByInstances(moduleIds);

    // map with moduleIds
    const mappedModules = _.map(result, (moduleInfo: Module, index: number) => {
      if (!moduleInfo) return undefined;

      const fullDetails = {
        ...moduleInfo,
        id: moduleIds[index],
      } as ModuleDetails;
      return fullDetails;
    });

    // thinks it's a true[]
    return _.compact(mappedModules) as unknown as ModuleDetails[];
  };

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['modulesDetails', moduleIds, chainId],
    queryFn: fetchModulesData,
    enabled: !!chainId,
  });

  return {
    modulesDetails: isSuccess ? data : [],
    isLoading: isLoading && !isSuccess,
  };
};

export default useModulesDetails;

import { Module } from '@hatsprotocol/modules-sdk';
import { useQueries } from '@tanstack/react-query';
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
  const getModuleData = async (address?: Hex) => {
    if (!chainId || !address) return null;

    const moduleClient = await createHatsModulesClient(chainId);
    if (!moduleClient) return null;

    const moduleData = await moduleClient.getModuleByInstance(address);
    if (!moduleData) return null;

    return moduleData as Module;
  };

  const result = useQueries({
    queries: moduleIds.map((address) => ({
      queryKey: ['moduleDetails', address],
      queryFn: () => getModuleData(address),
      enabled: !!address,
    })),
  });

  return {
    modulesDetails: _.compact(_.map(result, 'data')) as ModuleDetails[],
    isLoading: _.some(result, 'isLoading'),
  };
};

export default useModulesDetails;

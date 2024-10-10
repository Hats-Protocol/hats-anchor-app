import { Module } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useMemo } from 'react';
import { ModuleDetails, SupportedChains } from 'types';
import { createHatsModulesClient } from 'utils';
import { Hex } from 'viem';

const fetchModulesData = async ({
  chainId,
  moduleIds,
}: {
  chainId: number | undefined;
  moduleIds: Hex[] | null;
}) => {
  if (!chainId || !moduleIds) {
    return [];
  }
  const moduleClient = await createHatsModulesClient(chainId);
  if (!moduleClient) return [];

  const result = await moduleClient.getModulesByInstances(moduleIds);

  // map with moduleIds
  const mappedModules = _.map(result, (moduleInfo: Module, index: number) => {
    if (!moduleInfo) return undefined;

    return {
      ...moduleInfo,
      id: moduleIds[index],
    } as ModuleDetails;
  }) as unknown as ModuleDetails[];

  // thinks it's a true[]
  return _.compact(mappedModules);
};

const useModulesDetails = ({
  moduleIds,
  chainId,
  editMode,
}: {
  moduleIds: Hex[] | null;
  chainId: SupportedChains | undefined;
  editMode?: boolean;
}) => {
  const {
    data,
    isLoading: modulesLoading,
    fetchStatus,
  } = useQuery({
    queryKey: ['modulesDetails', moduleIds, chainId],
    queryFn: () => fetchModulesData({ chainId, moduleIds }),
    enabled: !!chainId && !_.isEmpty(moduleIds),
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  const isLoading = useMemo(
    () => modulesLoading && fetchStatus !== 'idle',
    [modulesLoading, fetchStatus],
  );

  return {
    modulesDetails: !isLoading ? data : [],
    isLoading,
  };
};

export default useModulesDetails;

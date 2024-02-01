import { Module } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { createHatsModulesClient } from 'app-utils';
import { ModuleDetails, SupportedChains } from 'hats-types';
import _ from 'lodash';

const useHatsModules = ({
  chainId,
  editMode,
}: {
  chainId: SupportedChains | undefined;
  editMode?: boolean;
}) => {
  const fetchModules = async () => {
    const hatsClient = await createHatsModulesClient(chainId);
    if (!hatsClient) {
      throw new Error('Unable to initialize hatsClient');
    }

    return hatsClient.getAllActiveModules();
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['hatsModules', chainId],
    queryFn: fetchModules,
    enabled: !!chainId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  const modules: ModuleDetails[] = _.map(
    data,
    (value: Module, key: string) =>
      ({
        id: key,
        ...value,
      } as ModuleDetails),
  );

  return { modules, isLoading, isError, error };
};

export default useHatsModules;

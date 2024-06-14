import { Module } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { ModuleDetails, SupportedChains } from 'types';
import { createHatsModulesClient } from 'utils';

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

    // filter out inactive and meta modules
    const modulesFilter = (module: Module) => {
      for (let tagIndex = 0; tagIndex < module.tags.length; tagIndex += 1) {
        const tag = module.tags[tagIndex];
        if (tag.value === 'deprecated' || tag.value === 'meta') {
          return false;
        }
      }
      return true;
    };

    return hatsClient.getModules(modulesFilter);
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

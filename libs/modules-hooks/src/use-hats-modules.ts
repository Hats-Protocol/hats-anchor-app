import { Module } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { map } from 'lodash';
import { ModuleDetails, SupportedChains } from 'types';
import { createHatsModulesClient } from 'utils';

const useHatsModules = ({ chainId, editMode }: { chainId: SupportedChains | undefined; editMode?: boolean }) => {
  const fetchModules = async () => {
    const hatsClient = await createHatsModulesClient(chainId);
    if (!hatsClient) {
      throw new Error('Unable to initialize hatsClient');
    }

    // filter out inactive and meta modules
    const modulesFilter = (module: Module) => {
      // ! temp workaround
      if (module.implementationAddress === '0x6AE5a62698f23dB7CAca13FFa7391ac782a94116') {
        return false;
      }
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

  const modules: ModuleDetails[] = map(
    data,
    (value: Module, key: string) =>
      ({
        ...value,
        id: key,
      }) as ModuleDetails,
  );

  return { modules, isLoading, isError, error };
};

export { useHatsModules };

import { map } from 'lodash';
import { ModuleDetails, SupportedChains } from 'types';
import { createHatsModulesClient } from 'utils';

export const fetchModulesParameters = async (
  modules: ModuleDetails[] | undefined,
  chainId: SupportedChains | undefined,
): Promise<ModuleDetails[]> => {
  if (!modules || !chainId) return [];

  const modulesClient = await createHatsModulesClient(chainId);

  const promises = map(modules, (m) => {
    return modulesClient?.getInstanceParameters(m.id);
  });

  const moduleParameters = await Promise.all(promises);

  return Promise.resolve(
    map(modules, (m, i) => ({
      ...m,
      liveParameters: moduleParameters[i],
    })),
  );
};

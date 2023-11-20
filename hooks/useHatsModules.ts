import { Module } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { createHatsModulesClient } from '@/lib/web3';
import { ModuleDetails } from '@/types';

const useHatsModules = () => {
  const { chainId } = useTreeForm();

  const fetchModules = async () => {
    const hatsClient = await createHatsModulesClient(chainId);
    if (!hatsClient) {
      throw new Error('Unable to initialize hatsClient');
    }

    return hatsClient.getAllModules();
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['hatsModules', chainId],
    queryFn: fetchModules,
    enabled: !!chainId,
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

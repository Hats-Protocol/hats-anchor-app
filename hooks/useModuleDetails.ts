import { Module } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { createHatsModulesClient } from '@/lib/web3';

interface ModuleParameters {
  label: string;
  value: unknown;
  solidityType: string;
  displayType: string;
}

const useModuleDetails = (type: string) => {
  const { selectedHat, chainId } = useTreeForm();
  const [module, setModule] = useState<Module | undefined>();
  const [moduleParameters, setModuleParameters] = useState<
    ModuleParameters[] | undefined
  >();

  const moduleAddress = useMemo(() => {
    if (!selectedHat) return undefined;
    return _.get(selectedHat, _.toLower(type));
  }, [selectedHat, type]);

  useEffect(() => {
    const clearData = () => {
      setModule(undefined);
      setModuleParameters(undefined);
    };
    const getModuleData = async () => {
      if (!chainId || !moduleAddress) {
        clearData();
        return;
      }
      const moduleClient = await createHatsModulesClient(chainId);
      if (!moduleClient) {
        clearData();
        return;
      }
      const promises = [
        moduleClient.getModuleByInstance(moduleAddress),
        moduleClient.getInstanceParameters(moduleAddress),
      ];
      const [moduleData, localModuleParameters] = await Promise.all(promises);
      if (!moduleData) {
        clearData();
        return;
      }
      setModule(moduleData as Module);
      setModuleParameters(localModuleParameters as ModuleParameters[]);
    };
    getModuleData();
  }, [moduleAddress, chainId]);

  return { data: module, parameters: moduleParameters };
};

export default useModuleDetails;

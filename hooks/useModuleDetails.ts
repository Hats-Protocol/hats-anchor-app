import { Module } from '@hatsprotocol/modules-sdk';
import { useEffect, useState } from 'react';
import { Hex } from 'viem';

import { createHatsModulesClient } from '@/lib/web3';

interface ModuleParameters {
  label: string;
  value: unknown;
  solidityType: string;
  displayType: string;
}

const useModuleDetails = (
  address: Hex | undefined,
  chainId: number | undefined,
) => {
  const [module, setModule] = useState<Module | undefined>();
  const [moduleParameters, setModuleParameters] = useState<
    ModuleParameters[] | undefined
  >();

  useEffect(() => {
    const getModuleData = async () => {
      if (!chainId || !address) return;
      const moduleClient = await createHatsModulesClient(chainId);
      if (!moduleClient) return;
      const moduleData = await moduleClient.getModuleByInstance(address);
      const localModuleParameters = await moduleClient.getInstanceParameters(
        address,
      );
      if (!moduleData) return;
      setModule(moduleData);
      setModuleParameters(localModuleParameters);
    };
    getModuleData();
  }, [address, chainId]);

  return { data: module, parameters: moduleParameters };
};

export default useModuleDetails;

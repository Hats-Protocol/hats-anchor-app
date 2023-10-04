import { Module } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { Hex } from 'viem';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { createHatsModulesClient } from '@/lib/web3';

interface ModuleParameters {
  label: string;
  value: unknown;
  solidityType: string;
  displayType: string;
}

const useModuleDetails = ({
  address,
  enabled = true,
}: {
  address?: Hex;
  enabled?: boolean;
}) => {
  const { chainId } = useTreeForm();

  const getModuleData = async () => {
    if (!chainId || !address) return null;

    const moduleClient = await createHatsModulesClient(chainId);
    if (!moduleClient) return null;

    const promises = [
      moduleClient.getModuleByInstance(address),
      moduleClient.getInstanceParameters(address),
    ];
    const [moduleData, localModuleParameters] = await Promise.all(promises);
    if (!moduleData) return null;

    return {
      details: moduleData as Module,
      parameters: localModuleParameters as ModuleParameters[],
    };
  };

  const { data } = useQuery({
    queryKey: ['moduleDetails', address],
    queryFn: getModuleData,
    enabled:
      !!address &&
      address !== '0x0000000000000000000000000000000000004a75' &&
      enabled,
  });

  return { data };
};

export default useModuleDetails;

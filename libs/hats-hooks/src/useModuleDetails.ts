import { Module } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { FALLBACK_ADDRESS, ZERO_ADDRESS } from 'app-constants';
import { createHatsModulesClient } from 'app-utils';
import { SupportedChains } from 'hats-types';
import { Hex } from 'viem';

interface ModuleParameters {
  label: string;
  value: unknown;
  solidityType: string;
  displayType: string;
}

// modules-hooks
const useModuleDetails = ({
  address,
  chainId,
  enabled = true,
}: {
  address: Hex | undefined;
  chainId: SupportedChains | undefined;
  enabled?: boolean;
}) => {
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
      address !== FALLBACK_ADDRESS &&
      address !== ZERO_ADDRESS &&
      enabled,
  });

  return { details: data?.details, parameters: data?.parameters };
};

export default useModuleDetails;

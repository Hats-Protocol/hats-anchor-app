import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import { createHatsModulesClient } from 'app-utils';
import { SupportedChains } from 'hats-types';
import { Hex, zeroAddress } from 'viem';

// modules-hooks
const useModuleDetails = ({
  address,
  chainId,
  enabled = true,
  editMode,
}: {
  address: Hex | undefined;
  chainId: SupportedChains | undefined;
  enabled?: boolean;
  editMode?: boolean;
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
      parameters: localModuleParameters as ModuleParameter[],
    };
  };

  const { data, isLoading } = useQuery({
    queryKey: ['moduleDetails', address],
    queryFn: getModuleData,
    enabled:
      !!address &&
      address !== FALLBACK_ADDRESS &&
      address !== zeroAddress &&
      enabled,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return { details: data?.details, parameters: data?.parameters, isLoading };
};

export default useModuleDetails;

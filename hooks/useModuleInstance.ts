import { useQuery } from '@tanstack/react-query';
import { Hex } from 'viem';

import { createHatsModulesClient } from '@/lib/web3';

const useModuleInstance = ({
  address,
  chainId,
  enabled = true,
}: {
  address?: Hex;
  chainId: number | undefined;
  enabled?: boolean;
}) => {
  const checkModuleInstance = async () => {
    if (!address) return undefined;
    const modulesClient = await createHatsModulesClient(chainId);
    const promises = [
      modulesClient?.getModuleByInstance(address),
      modulesClient?.getInstanceParameters(address),
    ];
    const [details, parameters] = await Promise.all(promises);

    return Promise.resolve({ details, parameters });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['moduleInstance', { address }],
    queryFn: checkModuleInstance,
    enabled: !!address && enabled,
  });

  return { data, isLoading };
};

export default useModuleInstance;

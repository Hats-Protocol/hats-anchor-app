import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import { HatsModulesClient, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { ModuleDetails, SupportedChains } from 'types';
import { createHatsModulesClient } from 'utils';
import { Hex, WalletClient, zeroAddress } from 'viem';
import { useWalletClient } from 'wagmi';

const getModuleData = async ({
  address,
  chainId,
  walletClient,
}: {
  address: Hex | undefined;
  chainId: SupportedChains | undefined;
  walletClient: WalletClient | undefined;
}) => {
  if (!chainId || !address) return Promise.resolve(null);

  return createHatsModulesClient(chainId, walletClient)
    .then(async (modulesClient: HatsModulesClient | null) => {
      if (!modulesClient) return Promise.resolve(null);

      const promises = [
        modulesClient.getModuleByInstance(address),
        modulesClient.getInstanceParameters(address),
      ];
      return Promise.all(promises)
        .then((data) => {
          const [moduleData, moduleParameters] = data;

          if (!moduleData) return Promise.resolve(null);

          return Promise.resolve({
            details: moduleData || (null as ModuleDetails | null),
            parameters: moduleParameters || (null as ModuleParameter[] | null),
          });
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(err);
          return Promise.resolve(null);
        });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      return Promise.resolve(null);
    });
};

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
  const { data: walletClient, isLoading: isWalletClientLoading } =
    useWalletClient();

  const { data, isLoading, fetchStatus } = useQuery({
    queryKey: ['moduleDetails', { address, chainId, walletClient }],
    queryFn: () => getModuleData({ address, chainId, walletClient }),
    enabled:
      !!address &&
      !!chainId &&
      !isWalletClientLoading &&
      address !== FALLBACK_ADDRESS &&
      address !== zeroAddress &&
      enabled,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return {
    details: data?.details as ModuleDetails | undefined,
    parameters: data?.parameters as ModuleParameter[] | undefined,
    isLoading: isLoading && fetchStatus !== 'idle',
  };
};

export default useModuleDetails;

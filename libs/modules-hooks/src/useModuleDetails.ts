'use client';

import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import { HatsModulesClient, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { ModuleDetails, SupportedChains } from 'types';
import { createHatsModulesClient } from 'utils';
import { Hex, zeroAddress } from 'viem';
import { useWalletClient } from 'wagmi';

const getModuleData = async ({
  address,
  chainId,
}: {
  address: Hex | undefined;
  chainId: SupportedChains | undefined;
}) => {
  if (!chainId || !address) return Promise.resolve(null);

  return createHatsModulesClient(chainId)
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
            details: moduleData || null as ModuleDetails | null,
            parameters: moduleParameters || null as ModuleParameter[] | null,
          });
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(err);
          return Promise.resolve(null);
        });
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      return Promise.resolve(null);
    })
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

  const client = useWalletClient()

  const { data, isLoading, fetchStatus } = useQuery({
    queryKey: ['moduleDetails', { address, chainId }],
    queryFn: () => getModuleData({ address, chainId }),
    enabled:
      !!address &&
      !!chainId &&
      !!client &&
      address !== FALLBACK_ADDRESS &&
      address !== zeroAddress &&
      enabled,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return {
    details: data?.details,
    parameters: data?.parameters,
    isLoading: isLoading && fetchStatus !== 'idle',
  };
};

export default useModuleDetails;

'use client';

import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import { ModuleParameter, Ruleset } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { ModuleDetails, SupportedChains } from 'types';
import { createHatsModulesClient } from 'utils';
import { Hex, zeroAddress } from 'viem';

const getModuleData = async ({
  address,
  chainId,
}: {
  address: Hex | undefined;
  chainId: SupportedChains | undefined;
}) => {
  if (!chainId || !address) return null;

  const modulesClient = await createHatsModulesClient(chainId);
  if (!modulesClient) return null;

  const promises = [
    modulesClient.getModuleByInstance(address),
    modulesClient.getInstanceParameters(address),
    modulesClient.getRulesets(address),
  ];
  return Promise.all(promises)
    .then((data) => {
      const [moduleData, localModuleParameters, ruleSets] = data;

      if (!moduleData) return null;

      return {
        details: moduleData as ModuleDetails,
        parameters: localModuleParameters as ModuleParameter[],
        ruleSets: ruleSets as Ruleset[],
      };
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      return null;
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
  const { data, isLoading, fetchStatus } = useQuery({
    queryKey: ['moduleDetails', { address, chainId }],
    queryFn: () => getModuleData({ address, chainId }),
    enabled:
      !!address &&
      !!chainId &&
      address !== FALLBACK_ADDRESS &&
      address !== zeroAddress &&
      enabled,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  return {
    details: data?.details,
    parameters: data?.parameters,
    ruleSets: data?.ruleSets,
    isLoading: isLoading && fetchStatus !== 'idle',
  };
};

export default useModuleDetails;

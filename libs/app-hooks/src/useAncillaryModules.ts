import { Module } from '@hatsprotocol/modules-sdk';
import { useQueries, useQuery } from '@tanstack/react-query';
import { createHatsModulesClient, fetchAncillaryModules } from 'app-utils';
import { HatAuthority, SupportedChains } from 'hats-types';
import _ from 'lodash';
import { Hex } from 'viem';

const useAncillaryModules = ({
  id,
  chainId,
}: {
  id?: string;
  chainId: SupportedChains;
}) => {
  const getModuleData = async (address?: Hex) => {
    if (!chainId || !address) return null;

    const moduleClient = await createHatsModulesClient(chainId);
    if (!moduleClient) return null;

    const moduleData = await moduleClient.getModuleByInstance(address);
    if (!moduleData) return null;

    return moduleData as Module;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['ancillaryModules', id],
    queryFn: () => fetchAncillaryModules(id),
    enabled: !!id,
  });

  const extractModuleIds = (hatAuthority: HatAuthority) => {
    return _.flatMap(_.values(hatAuthority), (items) =>
      items.map((item) => item.id),
    );
  };

  const moduleIds = data?.hatAuthority
    ? _.uniq(extractModuleIds(data.hatAuthority))
    : [];

  const storedModuleDetails = useQueries({
    queries: moduleIds.map((address) => ({
      queryKey: ['moduleDetails', address],
      queryFn: () => getModuleData(address),
      enabled: !!address,
    })),
  });

  return {
    hatAuthority: data?.hatAuthority,
    moduleDetails: storedModuleDetails.map((result) => result.data),
    error,
    isLoading,
  };
};

export default useAncillaryModules;

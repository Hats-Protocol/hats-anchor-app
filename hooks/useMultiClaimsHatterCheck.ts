import { Module } from '@hatsprotocol/modules-sdk';
import { useQueries } from '@tanstack/react-query';
import _ from 'lodash';
import { useMemo } from 'react';
import { Hex } from 'viem';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { createHatsModulesClient } from '@/lib/web3';

const useCheckMultiClaimsHatter = (hats: Hex[]) => {
  const { chainId, onchainHats } = useTreeForm();

  const addresses = useMemo(() => {
    return _.flatMap(hats, (hatId) => {
      const hat = _.find(onchainHats, { id: hatId });
      return _.map(_.get(hat, 'wearers', []), 'id');
    });
  }, [onchainHats, hats]);

  const getModuleData = async (address: Hex) => {
    if (!chainId || !address) return null;

    const moduleClient = await createHatsModulesClient(chainId);
    if (!moduleClient) return null;

    const moduleData = await moduleClient.getModuleByInstance(address);
    if (!moduleData) return null;

    return moduleData as Module;
  };

  const results = useQueries({
    queries: addresses.map((address) => ({
      queryKey: ['moduleDetails', address],
      queryFn: () => getModuleData(address),
      enabled: !!address,
    })),
  });

  const isLoading = _.some(results, ['isLoading', true]);

  const foundModuleResult = _.find(
    results,
    (res) => res.data?.name === 'Multi Claims Hatter',
  );

  const instanceAddress = foundModuleResult?.data
    ? addresses[results.indexOf(foundModuleResult)]
    : undefined;

  return {
    multiClaimsHatter: foundModuleResult?.data,
    instanceAddress,
    isLoading,
  };
};

export default useCheckMultiClaimsHatter;

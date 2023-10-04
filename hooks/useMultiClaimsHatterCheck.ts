import { Module } from '@hatsprotocol/modules-sdk';
import { useQueries } from '@tanstack/react-query';
import _ from 'lodash';
import { Hex } from 'viem';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { createHatsModulesClient } from '@/lib/web3';

const useCheckMultiClaimsHatter = (addresses: Hex[]) => {
  const { chainId } = useTreeForm();

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

  const foundAddress = foundModuleResult?.data
    ? addresses[results.indexOf(foundModuleResult)]
    : null;

  return {
    multiClaimsHatter: foundModuleResult?.data,
    address: foundAddress,
    isLoading,
  };
};

export default useCheckMultiClaimsHatter;

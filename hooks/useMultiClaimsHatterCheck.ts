import { Module } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useMemo } from 'react';
import { Hex } from 'viem';

import { useTreeForm } from '@/contexts/TreeFormContext';
import client from '@/gql/client';
import { GET_HATTERS_FOR_HATS } from '@/gql/queries/hat';
import { createHatsModulesClient } from '@/lib/web3';

import useModuleDetails from './useModuleDetails';

const fetchHattersHelper = async (chainId: number, hats: Hex[]) => {
  const result = await client(chainId).request(GET_HATTERS_FOR_HATS, {
    hatIds: hats,
  });

  return _.get(result, 'hats');
};

const useCheckMultiClaimsHatter = () => {
  const { chainId, onchainHats } = useTreeForm();

  const allHatIds = useMemo(() => _.map(onchainHats, 'id'), [onchainHats]);

  const fetchHatters = async () => {
    if (!chainId || !allHatIds) return undefined;
    const result = await fetchHattersHelper(chainId, allHatIds);
    return result;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['claimsHatter', allHatIds],
    queryFn: fetchHatters,
    enabled: !!allHatIds,
  });

  const claimableHats = useMemo(() => {
    if (!data) return undefined;

    return _.map(_.filter(data, 'claimableBy[0].id'), 'id');
  }, [data]);

  const instanceAddress = useMemo(() => {
    if (!data) return undefined;
    return _.first(_.compact(_.map(data, 'claimableBy[0].id')));
  }, [data]);

  const { details } = useModuleDetails({ address: instanceAddress });

  console.log(claimableHats);

  return {
    multiClaimsHatter: details,
    instanceAddress,
    claimableHats,
    isLoading,
  };
};

export default useCheckMultiClaimsHatter;

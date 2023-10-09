import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { Hex } from 'viem';

import { useTreeForm } from '@/contexts/TreeFormContext';
import client from '@/gql/client';
import { fetchWearerDetails } from '@/gql/helpers';
import { GET_HATTERS_FOR_HATS } from '@/gql/queries/hat';

import useIsAdmin from './useIsAdmin';
import useModuleDetails from './useModuleDetails';

const fetchHattersHelper = async (chainId: number, hats: Hex[]) => {
  const result = await client(chainId).request(GET_HATTERS_FOR_HATS, {
    hatIds: hats,
  });

  return _.get(result, 'hats');
};

const useMultiClaimsHatterCheck = () => {
  const { chainId, onchainHats } = useTreeForm();
  const [wearingHat, setWearingHat] = useState<Hex | undefined>();

  const allHatIds = useMemo(() => _.map(onchainHats, 'id'), [onchainHats]);
  console.log('allHatIds', allHatIds);

  const fetchHatters = async () => {
    if (!chainId || !allHatIds) return undefined;
    const result = await fetchHattersHelper(chainId, allHatIds);
    console.log('result', result);
    return result;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['claimsHatter', allHatIds],
    queryFn: fetchHatters,
    enabled: !!allHatIds,
  });
  console.log('data', data);

  const claimableHats: Hex[] | undefined = useMemo(() => {
    if (!data) return undefined;

    return _.map(_.filter(data, 'claimableBy[0].id'), 'id');
  }, [data]);

  const instanceAddress: Hex | undefined = useMemo(() => {
    if (!data) return undefined;
    return _.first(_.compact(_.map(data, 'claimableBy[0].id')));
  }, [data]);

  useEffect(() => {
    const getHatterHat = async () => {
      if (!instanceAddress || !chainId) return;
      const result = await fetchWearerDetails(instanceAddress, chainId);
      setWearingHat(_.get(result, 'currentHats.[0].id'));
    };
    getHatterHat();
  }, [instanceAddress, chainId]);

  const { details } = useModuleDetails({ address: instanceAddress });
  const hatterIsAdmin = useIsAdmin(instanceAddress);

  return {
    multiClaimsHatter: details,
    wearingHat,
    instanceAddress,
    hatterIsAdmin,
    claimableHats,
    isLoading,
  };
};

export default useMultiClaimsHatterCheck;

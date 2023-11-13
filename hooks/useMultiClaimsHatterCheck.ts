import { Module } from '@hatsprotocol/modules-sdk';
import { useQueries, useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { Hex } from 'viem';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { fetchWearerDetails } from '@/gql/helpers';
import { createHatsModulesClient, createSubgraphClient } from '@/lib/web3';
import { Hat } from '@/types';

import useIsAdmin from './useIsAdmin';
import useModuleDetails from './useModuleDetails';

const fetchHattersHelper = async (chainId: number, hats: Hex[]) => {
  const subgraphClient = createSubgraphClient();
  const res = subgraphClient.getHatsByIds({
    chainId,
    hatIds: hats.map((hat) => BigInt(hat)),
    props: {
      claimableBy: {},
    },
  });

  return res as unknown as Promise<Hat[]>;
};

const useMultiClaimsHatterCheck = () => {
  const { chainId, onchainHats, storedData } = useTreeForm();
  const [wearingHat, setWearingHat] = useState<Hex | undefined>();
  const [instanceAddress, setInstanceAddress] = useState<Hex | undefined>();

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

  const claimableHats: Hex[] | undefined = useMemo(() => {
    if (!data) return undefined;

    return _.map(_.filter(data, 'claimableBy[0].id'), 'id');
  }, [data]);

  const { details } = useModuleDetails({ address: instanceAddress });
  const hatterIsAdmin = useIsAdmin(instanceAddress);

  const storedAddresses = _.uniq(
    _.compact(
      _.flatMap(storedData, ({ eligibility, toggle }) => [eligibility, toggle]),
    ),
  );

  const getModuleData = async (address?: Hex) => {
    if (!chainId || !address) return null;

    const moduleClient = await createHatsModulesClient(chainId);
    if (!moduleClient) return null;

    const moduleData = await moduleClient.getModuleByInstance(address);
    if (!moduleData) return null;

    return moduleData as Module;
  };

  const storedModuleDetails = useQueries({
    queries: storedAddresses.map((address) => ({
      queryKey: ['otherModuleDetails', address],
      queryFn: () => getModuleData(address),
      enabled: !!address,
    })),
  });

  const storedDataClaimableHats = _.compact(
    _.map(storedModuleDetails, (result, index) => {
      if (result.data) {
        return _.get(storedData, `[${index}].id`);
      }
      return null;
    }),
  );

  const hats = _.uniq(_.concat(claimableHats, storedDataClaimableHats));

  useEffect(() => {
    const getHatterHat = async () => {
      if (instanceAddress || !chainId) return;

      const onchainHatId = _.first(_.compact(_.map(data, 'claimableBy[0].id')));

      const claimsHatterIndex = _.findIndex(
        storedModuleDetails,
        (result) => _.get(result, 'data.name') === 'Multi Claims Hatter',
      );
      const storedDataHatId = _.get(storedData, `[${claimsHatterIndex}].id`);

      const address = onchainHatId || storedDataHatId;

      if (address) {
        setInstanceAddress(address);
        const result = await fetchWearerDetails(address, chainId);
        setWearingHat(_.get(result, 'currentHats.[0].id'));
      }
    };

    getHatterHat();
  }, [instanceAddress, chainId, data, storedModuleDetails, storedData]);

  return {
    multiClaimsHatter: details,
    wearingHat,
    instanceAddress,
    hatterIsAdmin,
    claimableHats: hats,
    isLoading,
  };
};

export default useMultiClaimsHatterCheck;

import { Module } from '@hatsprotocol/modules-sdk';
import { useQueries, useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useMemo } from 'react';
import { Hex } from 'viem';

import CONFIG from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { fetchWearerDetails } from '@/lib/subgraph';
import { createHatsModulesClient, createSubgraphClient } from '@/lib/web3';
import { FormData, Hat } from '@/types';

import useIsAdmin from './useIsAdmin';
import useModuleDetails from './useModuleDetails';

const fetchHattersHelper = async (chainId: number, hats: Hex[]) => {
  const subgraphClient = createSubgraphClient();
  const res = subgraphClient.getHatsByIds({
    chainId,
    hatIds: hats.map((hat) => BigInt(hat)),
    props: {
      claimableBy: { props: {} },
    },
  });

  return res as unknown as Promise<Hat[]>;
};

const fetchHatters = async (
  chainId: number | undefined,
  allHatIds: Hex[] | undefined,
) => {
  if (!chainId || !allHatIds) return undefined;
  const result = await fetchHattersHelper(chainId, allHatIds);
  return result;
};

const getHatterHat = async (
  claimsHatterData: Hat[] | undefined,
  storedModuleDetails: Module[] | undefined,
  storedData: Partial<FormData>[] | undefined,
  chainId: number | undefined,
) => {
  if (!chainId) return {};

  const onchainHatId = _.first(
    _.compact(_.map(claimsHatterData, 'claimableBy[0].id')),
  );

  const claimsHatterIndex = _.findIndex(
    storedModuleDetails,
    (result) => _.get(result, 'name') === CONFIG.claimsHatterModuleName,
  );
  const storedDataHatId = _.get(storedData, `[${claimsHatterIndex}].id`);

  const address = onchainHatId || storedDataHatId;

  if (address) {
    const result = await fetchWearerDetails(address, chainId);

    return {
      wearingHat: _.get(result, 'currentHats.[0].id'),
      instanceAddress: address,
    };
  }
  return {};
};

// modules-hooks
const useMultiClaimsHatterCheck = () => {
  const { chainId, onchainHats, storedData } = useTreeForm();

  const allHatIds = useMemo(() => _.map(onchainHats, 'id'), [onchainHats]);

  const {
    data: claimsHatterData,
    isLoading: claimsHatterLoading,
    error: claimsHatterError,
  } = useQuery({
    queryKey: ['claimsHatter', allHatIds, chainId],
    queryFn: () => fetchHatters(chainId, allHatIds),
    enabled: !!allHatIds && !!chainId,
  });

  const claimableHats: Hex[] | undefined = useMemo(() => {
    if (!claimsHatterData) return undefined;

    return _.map(_.filter(claimsHatterData, 'claimableBy[0].id'), 'id');
  }, [claimsHatterData]);

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
  const storedModulesDetailsData = _.compact(
    _.map(storedModuleDetails, 'data'),
  );
  const modulesLoading = _.some(storedModuleDetails, 'isLoading');

  const storedDataClaimableHats = _.compact(
    _.map(storedModuleDetails, (result, index) => {
      if (result.data) {
        return _.get(storedData, `[${index}].id`);
      }
      return null;
    }),
  );

  const hats = _.uniq(_.concat(claimableHats, storedDataClaimableHats));

  const {
    data: hatterHat,
    isLoading: hatterHatLoading,
    error: hatterHatError,
  } = useQuery({
    queryKey: [
      'hatterHat',
      { chainId, hats: _.map(claimsHatterData, 'id') },
      { storedModulesDetailsData, storedData },
    ],
    queryFn: () =>
      getHatterHat(
        claimsHatterData,
        storedModulesDetailsData,
        storedData,
        chainId,
      ),
    enabled: !!chainId && !!claimsHatterData,
  });

  const { details } = useModuleDetails({ address: hatterHat?.instanceAddress });
  const hatterIsAdmin = useIsAdmin(hatterHat?.instanceAddress);

  return {
    multiClaimsHatter: details,
    wearingHat: hatterHat?.wearingHat,
    instanceAddress: hatterHat?.instanceAddress,
    hatterIsAdmin,
    claimableHats: hats,
    isLoading: claimsHatterLoading || hatterHatLoading || modulesLoading,
    error: claimsHatterError || hatterHatError,
  };
};

export default useMultiClaimsHatterCheck;

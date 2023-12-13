import { Module } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { CONFIG } from 'app-constants';
import { createSubgraphClient, fetchWearerDetails } from 'app-utils';
import { FormData, Hat, ModuleDetails, SupportedChains } from 'hats-types';
import _ from 'lodash';
import { useMemo } from 'react';
import { Hex } from 'viem';

import useIsAdmin from './useIsAdmin';
import useModuleDetails from './useModuleDetails';
import useModulesDetails from './useModulesDetails';

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
    (result: Module) => _.get(result, 'name') === CONFIG.claimsHatterModuleName,
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

const useMultiClaimsHatterCheck = ({
  chainId,
  selectedHat,
  onchainHats,
  storedData,
  editMode,
}: {
  chainId: SupportedChains;
  selectedHat?: Hat;
  onchainHats: Hat[];
  storedData: Partial<FormData>[];
  editMode?: boolean;
}) => {
  const allHatIds = useMemo(() => _.map(onchainHats, 'id'), [onchainHats]);

  const {
    data: claimsHatterData,
    isLoading: claimsHatterLoading,
    error: claimsHatterError,
  } = useQuery({
    queryKey: ['claimsHatter', allHatIds, chainId],
    queryFn: () => fetchHatters(chainId, allHatIds),
    enabled: !!allHatIds && !!chainId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  const claimableHats: Hex[] | undefined = useMemo(() => {
    if (!claimsHatterData) return undefined;

    return _.map(_.filter(claimsHatterData, 'claimableBy[0].id'), 'id');
  }, [claimsHatterData]);

  const storedAddresses = _.uniq(
    _.compact(
      _.flatMap(storedData, ({ eligibility, toggle }: Partial<FormData>) => [
        eligibility,
        toggle,
      ]),
    ),
  );

  const { modulesDetails } = useModulesDetails({
    moduleIds: storedAddresses,
    chainId,
  });
  const modulesLoading = _.some(modulesDetails, 'isLoading');
  const storedDataClaimableHats = _.compact(
    _.map(modulesDetails, (data: ModuleDetails, index: number) => {
      if (data) {
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
      { storedModulesDetailsData: modulesDetails, storedData },
    ],
    queryFn: () =>
      getHatterHat(claimsHatterData, modulesDetails, storedData, chainId),
    enabled: !!chainId && !!claimsHatterData,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  const { details } = useModuleDetails({
    address: hatterHat?.instanceAddress,
    chainId,
  });
  const hatterIsAdmin = useIsAdmin({
    address: hatterHat?.instanceAddress,
    hatId: selectedHat?.id,
    chainId,
  });

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

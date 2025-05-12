import { CONFIG } from '@hatsprotocol/config';
import { Module } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useQuery } from '@tanstack/react-query';
import { useIsAdmin } from 'hats-hooks';
import { compact, concat, filter, findIndex, first, flatMap, get, includes, isEmpty, map, uniq } from 'lodash';
import { useMemo } from 'react';
import { AppHat, FormData, ModuleDetails, SupportedChains } from 'types';
import { createSubgraphClient, fetchWearerDetails } from 'utils';
import { Hex } from 'viem';

import { useModuleDetails } from './use-module-details';
import { useModulesDetails } from './use-modules-details';

const fetchHattersHelper = async (chainId: number, hats: Hex[]) => {
  if (isEmpty(hats)) return [];

  const subgraphClient = createSubgraphClient();
  const res = subgraphClient.getHatsByIds({
    chainId,
    hatIds: hats.map((hat) => BigInt(hat)),
    props: {
      claimableBy: { props: {} },
      claimableForBy: { props: {} },
    },
  });

  return res as unknown as Promise<AppHat[]>;
};

const fetchHatters = async (chainId: number | undefined, allHatIds: Hex[] | undefined) => {
  if (!chainId || !allHatIds || isEmpty(allHatIds)) return undefined;
  const result = await fetchHattersHelper(chainId, allHatIds);
  return result;
};

const getHatterHat = async (
  claimsHatterData: AppHat[] | undefined,
  storedModuleDetails: Module[] | undefined,
  storedData: Partial<FormData>[] | undefined,
  chainId: number | undefined,
) => {
  if (!chainId) return {};

  const onchainHatId = first(compact(map(claimsHatterData, 'claimableBy[0].id')));

  const claimsHatterV1Index = findIndex(
    storedModuleDetails,
    (result: Module) => get(result, 'implementationAddress') === CONFIG.modules.claimsHatterV1,
  );
  const claimsHatterV2Index = findIndex(
    storedModuleDetails,
    (result: Module) => get(result, 'implementationAddress') === CONFIG.modules.claimsHatterV2,
  );
  const storedDataHatId = get(storedData, `[${claimsHatterV1Index}].id`);
  const storedDataHatIdV3 = get(storedData, `[${claimsHatterV2Index}].id`);

  const address = onchainHatId || storedDataHatId || storedDataHatIdV3;

  if (address) {
    const result = await fetchWearerDetails(address, chainId);

    return {
      wearingHat: get(result, 'currentHats.[0].id'),
      instanceAddress: address,
    };
  }
  return {};
};

const useMultiClaimsHatterCheck = ({
  chainId,
  selectedHatId,
  onchainHats,
  storedData,
  editMode,
}: {
  chainId: SupportedChains | undefined;
  selectedHatId: Hex | undefined;
  onchainHats: AppHat[] | undefined;
  storedData?: Partial<FormData>[] | undefined;
  editMode?: boolean;
}) => {
  const allHatIds = useMemo(() => map(onchainHats, 'id'), [onchainHats]);

  const {
    data: claimsHatterData,
    isLoading: claimsHatterLoading,
    error: claimsHatterError,
  } = useQuery({
    queryKey: ['claimsHatter', allHatIds, chainId],
    queryFn: () => fetchHatters(chainId, allHatIds),
    enabled: !!allHatIds && !isEmpty(allHatIds) && !!chainId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  const claimableHats: Hex[] | undefined = useMemo(() => {
    if (!claimsHatterData) return undefined;

    return compact(map(filter(claimsHatterData, 'claimableBy[0].id'), 'id'));
  }, [claimsHatterData]);
  const claimableForHats: Hex[] | undefined = useMemo(() => {
    if (!claimsHatterData) return undefined;

    return map(filter(claimsHatterData, 'claimableForBy[0].id'), 'id');
  }, [claimsHatterData]);
  const currentHatIsClaimable = useMemo(() => {
    if (!selectedHatId || !claimableHats) return undefined;

    return {
      for: includes(claimableForHats, selectedHatId) || false,
      by: includes(claimableHats, selectedHatId) || false,
    };
  }, [selectedHatId, claimableHats, claimableForHats]);

  const storedAddresses = uniq(
    compact(flatMap(storedData, ({ eligibility, toggle }: Partial<FormData>) => [eligibility, toggle])),
  );

  const { modulesDetails, isLoading: modulesLoading } = useModulesDetails({
    moduleIds: storedAddresses,
    chainId,
    editMode,
  });

  const storedDataClaimableHats = compact(
    map(modulesDetails, (data: ModuleDetails, index: number) => {
      if (data) {
        const hat = get(storedData, `[${index}].id`);
        const parentId = get(hat, 'parentId');
        if (!parentId) return null;
        const parentIpId = hatIdDecimalToIp(BigInt(parentId));
        // if parent is top hat then hat cannot be permissionlessly claimed
        if (!parentIpId.includes('.')) return null;
        return get(storedData, `[${index}].id`);
      }
      return null;
    }),
  );

  const hats = compact(uniq(concat(claimableHats, storedDataClaimableHats)));

  const {
    data: hatterHat,
    isLoading: hatterHatLoading,
    error: hatterHatError,
  } = useQuery({
    queryKey: [
      'hatterHat',
      { chainId, hats: map(claimsHatterData, 'id') },
      { storedModulesDetailsData: modulesDetails, storedData },
    ],
    queryFn: () => getHatterHat(claimsHatterData, modulesDetails, storedData, chainId),
    enabled: !!chainId && !!claimsHatterData,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  const { details } = useModuleDetails({
    address: hatterHat?.instanceAddress,
    chainId,
  });
  const hatterIsAdmin = useIsAdmin({
    address: hatterHat?.instanceAddress,
    hatId: selectedHatId as Hex,
    chainId,
  });

  return {
    multiClaimsHatter: details,
    wearingHat: hatterHat?.wearingHat,
    instanceAddress: hatterHat?.instanceAddress,
    mchV2: details?.implementationAddress === CONFIG.modules.claimsHatterV2,
    hatterIsAdmin,
    currentHatIsClaimable,
    claimableHats: hats,
    claimableForHats,
    isLoading: claimsHatterLoading || hatterHatLoading || modulesLoading,
    error: claimsHatterError || hatterHatError,
  };
};

export { useMultiClaimsHatterCheck };

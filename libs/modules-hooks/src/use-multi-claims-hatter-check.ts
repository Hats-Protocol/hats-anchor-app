import { CONFIG } from '@hatsprotocol/config';
import { Module } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useQuery } from '@tanstack/react-query';
import { GraphQLClient } from 'graphql-request';
import { useIsAdmin } from 'hats-hooks';
import {
  compact,
  concat,
  filter,
  find,
  // findIndex,
  flatMap,
  flatten,
  get,
  includes,
  isEmpty,
  map,
  orderBy,
  uniq,
} from 'lodash';
import { useMemo } from 'react';
import { AppHat, FormData, ModuleDetails, SupportedChains } from 'types';
import { fetchWearerDetails, NETWORKS_PREFIX } from 'utils';
import { Hex } from 'viem';

import { useModuleDetails } from './use-module-details';
import { useModulesDetails } from './use-modules-details';

// const fetchHattersHelper = async (chainId: number, hats: Hex[]) => {
//   if (isEmpty(hats)) return [];

//   const subgraphClient = createSubgraphClient();
//   const res = subgraphClient.getHatsByIds({
//     chainId,
//     hatIds: hats.map((hat) => BigInt(hat)),
//     props: {
//       claimableBy: { props: {} },
//       claimableForBy: { props: {} },
//     },
//   });

//   return res as unknown as Promise<AppHat[]>;
// };

const FETCH_HATTERS_HELPER_MESH = (chainId: number) => `
  query getHatsByIds($hatIds: [ID!]!) {
    ${NETWORKS_PREFIX[chainId]}_hats(where: { id_in: $hatIds }) {
      id
      claimableBy {
        id
      }
      claimableForBy {
        id
      }
    }
  }
`;

const fetchHattersHelperMesh = async (chainId: number, hats: Hex[]): Promise<AppHat[]> => {
  if (isEmpty(hats)) return [];

  const client = new GraphQLClient(`${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string);
  const result = await client.request(FETCH_HATTERS_HELPER_MESH(chainId), {
    hatIds: hats,
  });
  return get(result, `${NETWORKS_PREFIX[chainId]}_hats`) as unknown as Promise<AppHat[]>;
};

const fetchHatters = async (chainId: number | undefined, allHatIds: Hex[] | undefined) => {
  if (!chainId || !allHatIds || isEmpty(allHatIds)) return undefined;
  const result = await fetchHattersHelperMesh(chainId, allHatIds);
  return result;
};

const getHatterHat = async (
  claimsHatterData: AppHat[] | undefined,
  moduleDetails: Module[] | undefined,
  storedData: Partial<FormData>[] | undefined,
  chainId: number | undefined,
) => {
  if (!chainId) return {};

  // Should be reliable to get the most recent version
  const sortedModules = orderBy(moduleDetails, 'version', 'desc');
  const claimsHatter = find(sortedModules, (result: Module) =>
    includes([CONFIG.modules.claimsHatterV2, CONFIG.modules.claimsHatterV1], get(result, 'implementationAddress')),
  );
  const address = claimsHatter?.id;

  // const claimsHatterV2Index = findIndex(
  //   moduleDetails,
  //   (result: Module) => get(result, 'implementationAddress') === CONFIG.modules.claimsHatterV2,
  // );
  // const claimsHatterV1Index = findIndex(
  //   moduleDetails,
  //   (result: Module) => get(result, 'implementationAddress') === CONFIG.modules.claimsHatterV1,
  // );
  // TODO should we be passing these hat IDs here? https://linear.app/hats-protocol/issue/BUILD-123/deploying-a-second-claims-hatter-in-a-tree-complicates-things
  // const storedDataHatId = get(storedData, `[${claimsHatterV1Index}].id`);
  // const storedDataHatIdV2 = get(storedData, `[${claimsHatterV2Index}].id`);

  if (address) {
    const hatterWearer = await fetchWearerDetails(address, chainId);

    return {
      wearingHat: get(hatterWearer, 'currentHats.[0].id'),
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

  const allHatters = useMemo(() => {
    if (!claimsHatterData) return [];
    return uniq(
      flatten(
        map(claimsHatterData, (h) => {
          return flatten(concat(map(get(h, 'claimableBy'), 'id'), map(get(h, 'claimableForBy'), 'id')));
        }),
      ),
    );
  }, [claimsHatterData]);

  // console.log('claimsHatterData', claimsHatterData, allHatters);

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
    moduleIds: concat(allHatters, storedAddresses) as Hex[],
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

  const { details: mchDetails } = useModuleDetails({
    address: hatterHat?.instanceAddress as Hex,
    chainId,
  });
  const hatterIsAdmin = useIsAdmin({
    address: hatterHat?.instanceAddress as Hex,
    hatId: selectedHatId as Hex,
    chainId,
  });

  return {
    multiClaimsHatter: mchDetails,
    wearingHat: hatterHat?.wearingHat,
    instanceAddress: hatterHat?.instanceAddress,
    mchV2: mchDetails?.implementationAddress === CONFIG.modules.claimsHatterV2,
    hatterIsAdmin,
    currentHatIsClaimable,
    claimableHats: hats,
    claimableForHats,
    isLoading: claimsHatterLoading || hatterHatLoading || modulesLoading,
    error: claimsHatterError || hatterHatError,
  };
};

export { useMultiClaimsHatterCheck };

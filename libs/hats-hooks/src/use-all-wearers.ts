import { useQuery } from '@tanstack/react-query';
import { GraphQLClient } from 'graphql-request';
import { flatten, get, map, range, toNumber } from 'lodash';
import { AppHat, HatWearer, SupportedChains } from 'types';
import { NETWORKS_PREFIX } from 'utils';
// import { createSubgraphClient } from 'utils';
import { Hex } from 'viem';

// TODO move to utils
// const fetchHatWearersPage = async ({ hatId, chainId, page }: { hatId: Hex; chainId: number; page: number }) => {
//   const subgraphClient = createSubgraphClient();

//   const res = await subgraphClient.getWearersOfHatPaginated({
//     chainId,
//     hatId: BigInt(hatId),
//     props: {},
//     page,
//     perPage: 1000,
//   });

//   return res;
// };

const FETCH_HAT_WEARERS_PAGE_QUERY = (chainId: number) => `
  query GetWearersOfHatPage($hatId: ID!, $first: Int!, $skip: Int!) {
    ${NETWORKS_PREFIX[chainId]}_wearers(first: $first, skip: $skip, where: { currentHats_: { id_in: [$hatId] } }) {
      id
    }
  }
`;

const fetchHatWearersPageMesh = async ({ hatId, chainId, page }: { hatId: Hex; chainId: number; page: number }) => {
  const meshClient = new GraphQLClient(`${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string);

  const res = await meshClient.request(FETCH_HAT_WEARERS_PAGE_QUERY(chainId), {
    hatId,
    first: 1000,
    skip: page * 1000,
  });

  return get(res, `${NETWORKS_PREFIX[chainId]}_wearers`) as unknown as HatWearer[];
};

const fetchAllWearers = async ({
  selectedHat,
  chainId,
  supply,
}: {
  selectedHat: AppHat | undefined;
  chainId: SupportedChains | undefined;
  supply: number | undefined;
}) => {
  if (!chainId || !selectedHat || !supply) return [];
  const pages = Math.ceil(supply / 1000);
  const promises = map(range(pages), (page: number) => {
    return fetchHatWearersPageMesh({ hatId: selectedHat?.id, chainId, page });
  });

  const result = await Promise.all(promises);

  return flatten(result) as HatWearer[];
};

const useAllWearers = ({
  selectedHat,
  chainId,
  enabled = true,
}: {
  selectedHat: AppHat | undefined;
  chainId: SupportedChains | undefined;
  enabled?: boolean;
}) => {
  const supply = toNumber(selectedHat?.currentSupply) ?? 0;

  const { data, error, isLoading } = useQuery({
    queryKey: ['allWearers', { selectedHat, chainId, supply }],
    queryFn: () => fetchAllWearers({ selectedHat, chainId, supply }),
    enabled: enabled && !!selectedHat?.id && !!chainId,
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
  });

  return { wearers: data || (selectedHat?.wearers as HatWearer[]), error, isLoading };
};

export { useAllWearers };

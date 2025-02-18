import { chainsList } from '@hatsprotocol/config';
import { DEFAULT_ENDPOINTS_CONFIG, Wearer } from '@hatsprotocol/sdk-v1-subgraph';
import { gql, GraphQLClient } from 'graphql-request';
import { compact, flatten, get, keys, map, toLower, toNumber } from 'lodash';
import { mapWithChainId } from 'shared';
import { AppHat, HatWearer } from 'types';
import { Hex } from 'viem';

import { checkAddressIsContract } from '../contract';
import { createSubgraphClient, viemPublicClient } from '../web3';
import { parseMetadata } from './mesh/fetch/utils';
import { fetchWearerDetailsMesh } from './mesh/fetch/wearer';

const chains = keys(chainsList);

export const wearersPerPage = 100;

export const fetchManyWearerDetails = async (wearerIds: Hex[], chainId: number): Promise<HatWearer[]> => {
  // two promises per address
  const promises = wearerIds.map((wearerId: Hex) => {
    return [
      checkAddressIsContract(wearerId, chainId),
      viemPublicClient(1).getEnsName({
        address: wearerId,
      }),
    ];
  });
  const data = await Promise.all(flatten(promises)).catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err);
    return [];
  });

  // map with ID so can be looked up later
  return map(wearerIds, (wearerId: Hex, index: number) => {
    return {
      id: wearerId,
      isContract: data[index * 2] as boolean,
      ensName: data[index * 2 + 1] as string,
    };
  });
};

export const fetchWearerDetails = async (address: Hex | string | undefined, chainId: number | undefined) => {
  const subgraphClient = createSubgraphClient();
  if (!address || !chainId) return undefined;

  let res: Wearer | undefined;
  try {
    res = await subgraphClient.getWearer({
      chainId,
      wearerAddress: address as Hex,
      props: {
        currentHats: {
          props: {
            prettyId: true,
            status: true,
            createdAt: true,
            details: true,
            maxSupply: true,
            eligibility: true,
            toggle: true,
            mutable: true,
            imageUri: true,
            levelAtLocalTree: true,
            claimableBy: { props: {} },
            claimableForBy: { props: {} },
            currentSupply: true,
            tree: {},
            wearers: { props: {} },
            admin: {},
            events: {
              props: { timestamp: true, transactionID: true },
            },
          },
          filters: {
            first: 1000,
          },
        },
      },
    });
  } catch (err) {
    return undefined;
  }

  return {
    ...res,
    currentHats: mapWithChainId(res.currentHats, chainId),
  };
};

export const fetchWearerDetailsForChain = async (address: string | undefined, chainId: number) => {
  if (!address) return Promise.resolve([]);
  return fetchWearerDetailsMesh(toLower(address), chainId)
    .then((data) => {
      if (!data) return Promise.resolve([]);

      const currentHats = get(data, 'currentHats');
      const withProcessedMetadata = map(currentHats, parseMetadata) as unknown as AppHat[];

      return Promise.resolve(withProcessedMetadata);
    })
    .catch((err) => {
      return Promise.resolve([]);
    });
};

export const fetchWearerDetailsForAllChains = async (address: string | undefined) => {
  if (!address) return [];
  const promises = map(chains, (cId: string) => fetchWearerDetailsMesh(address, Number(cId)));

  // TODO migrate to shared query at mesh
  // * let errors fall through here
  return Promise.all(map(promises, (p: Promise<() => void>) => p.catch(() => undefined))).then((data) => {
    // TODO [low] handle errors on subgraph(s) with the user
    return Promise.resolve(flatten(map(compact(data), 'currentHats')));
  });
};

export const fetchPaginatedWearersForHat = async (hatId: string, chainId: number, page: number = 0) => {
  const subgraphClient = createSubgraphClient();

  const res = await subgraphClient.getWearersOfHatPaginated({
    chainId,
    hatId: BigInt(hatId),
    props: {},
    page,
    perPage: wearersPerPage,
  });

  const wearersWithDetails = await fetchManyWearerDetails(map(res, 'id') as Hex[], chainId);

  return wearersWithDetails;
};

export const EVENT_DETAILS_FRAGMENT = gql`
  fragment EventDetails on HatsEvent {
    id
    timestamp
    transactionID
  }
`;

const HAT_DETAILS_WITHOUT_EVENTS_FRAGMENT = gql`
  fragment HatDetailsUnit on Hat {
    id
    prettyId
    status
    createdAt
    details
    maxSupply
    eligibility
    toggle
    mutable
    imageUri
    levelAtLocalTree
    claimableBy(first: 1) {
      id
    }
    claimableForBy(first: 1) {
      id
    }
    currentSupply
    tree {
      id
    }
    wearers {
      id
    }
    admin {
      id
    }
  }
`;

const HAT_DETAILS_FRAGMENT = gql`
  fragment HatDetails on Hat {
    ...HatDetailsUnit
    events(orderBy: timestamp, orderDirection: desc) {
      ...EventDetails
    }
  }
  ${HAT_DETAILS_WITHOUT_EVENTS_FRAGMENT}
  ${EVENT_DETAILS_FRAGMENT}
`;

export const GET_CONTROLLERS_FOR_USER = gql`
  query getControllersForUser($address: String!) {
    hats(where: { or: [{ toggle: $address }, { eligibility: $address }] }) {
      ...HatDetails
    }
  }
  ${HAT_DETAILS_FRAGMENT}
`;

// TODO use subgraph client directly
export const fetchControllersForUser = async (a: string) => {
  const promises = map(chains, (cId: number) => {
    const subgraphClient = new GraphQLClient(DEFAULT_ENDPOINTS_CONFIG[cId].endpoint);
    if (subgraphClient !== undefined) {
      return subgraphClient.request(GET_CONTROLLERS_FOR_USER, {
        address: toLower(a),
      });
    }
    return undefined;
  });

  const data: unknown[] = await Promise.all(promises);

  const mapWithChains = map(data, (d: { hats: AppHat[] }, i: number) => {
    const hats = map(d.hats, (h: AppHat) => ({
      ...h,
      chainId: toNumber(chains[i]),
    }));

    return { hats };
  });

  return flatten(map(mapWithChains, 'hats'));
};

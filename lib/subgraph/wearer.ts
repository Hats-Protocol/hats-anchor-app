import {
  DEFAULT_ENDPOINTS_CONFIG,
  Wearer,
} from '@hatsprotocol/sdk-v1-subgraph';
import { fetchEnsName } from '@wagmi/core';
import { gql, GraphQLClient } from 'graphql-request';
import _ from 'lodash';
import { Hex } from 'viem';

import { chainsList } from '@/lib/chains';
import { checkAddressIsContract } from '@/lib/contract';
import { mapWithChainId } from '@/lib/general';
import { createSubgraphClient } from '@/lib/web3';
import { Hat, HatWearer } from '@/types';

const chains = _.keys(chainsList);

export const wearersPerPage = 100;

export const fetchManyWearerDetails = async (
  wearerIds: Hex[],
  chainId: number,
): Promise<HatWearer[]> => {
  // two promises per address
  const promises = wearerIds.map((wearerId: Hex) => {
    return [
      checkAddressIsContract(wearerId, chainId),
      fetchEnsName({
        address: wearerId,
        chainId: 1,
      }),
    ];
  });
  const data = await Promise.all(_.flatten(promises)).catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err);
    return [];
  });

  // map with ID so can be looked up later
  return _.map(wearerIds, (wearerId, index) => {
    return {
      id: wearerId,
      isContract: data[index * 2] as boolean,
      ensName: data[index * 2 + 1] as string,
    };
  });
};

export const fetchWearerDetails = async (
  address: Hex | string | undefined,
  chainId: number,
) => {
  const subgraphClient = createSubgraphClient();

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

export const fetchWearerDetailsForChain = async (
  address: string | undefined,
  chainId: number,
) => {
  if (!address) return [];
  const data = await fetchWearerDetails(address, chainId);
  if (!data) return [];

  return data.currentHats;
};

export const fetchWearerDetailsForAllChains = async (
  address: string | undefined,
) => {
  if (!address) return [];
  const promises = _.map(chains, (cId: string) =>
    fetchWearerDetails(address, Number(cId)),
  );

  // * let errors fall through here
  return Promise.all(_.map(promises, (p) => p.catch(() => undefined))).then(
    (data) => {
      // TODO handle errors on subgraph(s) with the user
      return Promise.resolve(_.flatten(_.map(_.compact(data), 'currentHats')));
    },
  );
};

export const fetchPaginatedWearersForHat = async (
  hatId: string,
  chainId: number,
  page: number = 0,
) => {
  const subgraphClient = createSubgraphClient();

  const res = await subgraphClient.getWearersOfHatPaginated({
    chainId,
    hatId: BigInt(hatId),
    props: {},
    page,
    perPage: wearersPerPage,
  });

  const wearersWithDetails = await fetchManyWearerDetails(
    _.map(res, 'id') as Hex[],
    chainId,
  );

  return wearersWithDetails;
};

// TODO replace with where stmt in subgraph client
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
    # TODO need to handle more than 1 "registered" hatter instance?
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

export const fetchControllersForUser = async (a: string) => {
  const promises = _.map(chains, (cId: number) => {
    const subgraphClient = new GraphQLClient(
      DEFAULT_ENDPOINTS_CONFIG[cId].endpoint,
    );
    if (subgraphClient !== undefined) {
      return subgraphClient.request(GET_CONTROLLERS_FOR_USER, {
        address: _.toLower(a),
      });
    }
    return undefined;
  });

  const data: unknown[] = await Promise.all(promises);

  const mapWithChains = _.map(data, (d: { hats: Hat[] }, i: number) => {
    const hats = _.map(d.hats, (h) => ({
      ...h,
      chainId: _.toNumber(chains[i]),
    }));

    return { hats };
  });

  return _.flatten(_.map(mapWithChains, 'hats'));
};

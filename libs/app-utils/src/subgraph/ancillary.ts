/* eslint-disable import/prefer-default-export */
import { gql, GraphQLClient } from 'graphql-request';
import { HatAuthorityResponse, HatSignerGatesResponse } from 'hats-types';
import { Hex } from 'viem';

const MODULES_QUERY = gql`
  query GetModuleAuthorities($id: ID!) {
    hatAuthority(id: $id) {
      allowListOwner {
        id
      }
      allowListArbitrator {
        id
      }
      electionsAdmin {
        id
      }
      electionsBallotBox {
        id
      }
      eligibilityTogglePassthrough {
        id
      }
      hsgOwner {
        id
      }
      hsgSigner {
        id
      }
      jokeraceAdmin {
        id
      }
      stakingJudge {
        id
      }
      stakingRecipient {
        id
      }
    }
  }
`;

const SIGNER_GATES_QUERY = gql`
  query GetHatsSignerGates($ids: [ID!]) {
    hatsSignerGates(where: { id_in: $ids }) {
      id
      type
      safe
      minThreshold
      targetThreshold
      maxSigners
    }
  }
`;

const ANCILLARY_API_URL = {
  5: 'https://api.studio.thegraph.com/query/55784/hats-v1-goerli-ancillary/version/latest',
};

const ancillarySubgraphClient = new GraphQLClient(ANCILLARY_API_URL[5]);

export const fetchAncillaryModules = async (
  id?: string,
): Promise<HatAuthorityResponse | null> => {
  if (!id) return null;

  try {
    const response =
      await ancillarySubgraphClient.request<HatAuthorityResponse>(
        MODULES_QUERY,
        {
          id,
        },
      );

    return response.hatAuthority ? response : null;
  } catch (error) {
    console.error('Error fetching ancillary modules:', error);
    return null;
  }
};

export const fetchHatsSignerGates = async (
  ids?: Hex[],
): Promise<any | null> => {
  if (!ids) return null;

  try {
    const response =
      await ancillarySubgraphClient.request<HatSignerGatesResponse>(
        SIGNER_GATES_QUERY,
        {
          ids,
        },
      );

    return response.hatsSignerGates ? response.hatsSignerGates : null;
  } catch (error) {
    console.error('Error fetching hats signer gate:', error);
    return null;
  }
};

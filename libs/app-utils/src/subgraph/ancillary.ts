/* eslint-disable import/prefer-default-export */
import { gql, GraphQLClient } from 'graphql-request';
import { HatAuthorityResponse } from 'hats-types';

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

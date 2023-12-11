/* eslint-disable import/prefer-default-export */
import { gql, GraphQLClient } from 'graphql-request';
import _ from 'lodash';

const MODULES_QUERY = gql`
  query GetModuleAuthorities($id: String!) {
    hatAuthorities(where: { id: $id }) {
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

export const fetchAncillaryModules = async (ids: string[]) => {
  const response = await ancillarySubgraphClient.request(MODULES_QUERY, {
    ids,
  });

  const moduleLookups = ['jokeRaceEligibilities'];
  const modules = _.pick(response, moduleLookups);

  return modules;
};

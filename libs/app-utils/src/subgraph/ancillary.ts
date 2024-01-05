/* eslint-disable import/prefer-default-export */
import { gql, GraphQLClient } from 'graphql-request';
import { HatAuthorityResponse, SupportedChains } from 'hats-types';

const MODULES_QUERY = gql`
  query GetModuleAuthorities($id: ID!) {
    hatAuthority(id: $id) {
      allowListOwner {
        id
        hatId
      }
      allowListArbitrator {
        id
        hatId
      }
      electionsAdmin {
        id
        hatId
      }
      electionsBallotBox {
        id
        hatId
      }
      eligibilityTogglePassthrough {
        id
        hatId
      }
      hsgOwner {
        id
        type
        safe
        minThreshold
        targetThreshold
        maxSigners
        signerHats {
          id
        }
      }
      hsgSigner {
        id
        type
        safe
        minThreshold
        targetThreshold
        maxSigners
        ownerHat {
          id
        }
      }
      jokeraceAdmin {
        id
        hatId
      }
      stakingJudge {
        id
        hatId
      }
      stakingRecipient {
        id
        hatId
      }
    }
  }
`;

const ANCILLARY_API_URL: { [key in SupportedChains]: string | undefined } = {
  1: 'https://api.studio.thegraph.com/query/55784/hats-v1-ethereum-ancillary/version/latest',
  5: 'https://api.studio.thegraph.com/query/55784/hats-v1-goerli-ancillary/version/latest',
  10: 'https://api.studio.thegraph.com/query/55784/hats-v1-optimism-ancillary/version/latest',
  100: 'https://api.studio.thegraph.com/query/55784/hats-v1-gnosis-chain-ancillary/version/latest',
  137: 'https://api.studio.thegraph.com/query/55784/hats-v1-polygon-ancillary/version/latest',
  424: undefined,
  42161:
    'https://api.studio.thegraph.com/query/55784/hats-v1-arbitrum-ancillary/version/latest',
  11155111: undefined,
};

const ancillarySubgraphClient = (chainId: SupportedChains) => {
  const url = ANCILLARY_API_URL[chainId];
  if (url) {
    return new GraphQLClient(url);
  }
  return undefined;
};

export const fetchAncillaryModules = async (
  id: string,
  chainId: SupportedChains,
): Promise<HatAuthorityResponse | null> => {
  if (!id) return null;

  try {
    const client = ancillarySubgraphClient(chainId);
    if (!client) return null;
    const response = await client.request<HatAuthorityResponse>(MODULES_QUERY, {
      id,
    });

    return response.hatAuthority ? response : null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching ancillary modules:', error);
    return null;
  }
};

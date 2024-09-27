import { ANCILLARY_API_URL } from '@hatsprotocol/constants';
import { gql, GraphQLClient } from 'graphql-request';
import {
  ElectionsAuthority,
  HatAuthorityResponse,
  HatElectionResponse,
  HatSignerGate,
  SupportedChains,
} from 'types';
import { Hex } from 'viem';

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
      hatsAccount1ofN {
        id
        accountOfHat {
          id
        }
        operations {
          id
          hatsAccount
          signer
          to
          value
          callData
          operationType
        }
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
      agreementOwner {
        id
        hatId
      }
      agreementArbitrator {
        id
        hatId
      }
    }
  }
`;

export const HSG_SIGNER_QUERY = gql`
  query GetHsgSigner($ids: [ID]!) {
    hatsSignerGates(where: { signerHats_: { id_in: $ids } }) {
      id
      type
      safe
      minThreshold
      targetThreshold
      maxSigners
      signerHats {
        id
      }
      ownerHat {
        id
      }
    }
  }
`;

const ELECTION_QUERY = gql`
  query GetElectionAuthorities($id: ID!) {
    hatsElectionEligibility(id: $id) {
      id
      hatId
      adminHat {
        id
      }
      ballotBoxHat {
        id
      }
      terms {
        id
        termStartedAt
        termEnd
        electionCompletedAt
        electedAccounts
      }
      currentTerm {
        id
        termStartedAt
        termEnd
        electionCompletedAt
        electedAccounts
      }
    }
  }
`;

export const ancillarySubgraphClient = (chainId: SupportedChains) => {
  const url = ANCILLARY_API_URL[chainId];
  if (url) {
    return new GraphQLClient(url);
  }
  return undefined;
};

export const fetchAncillaryModules = async (
  id: string,
  chainId: SupportedChains | undefined,
): Promise<HatAuthorityResponse | null> => {
  if (!id || !chainId) return null;

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

export const fetchElectionData = async (
  id: string,
  chainId: SupportedChains,
): Promise<ElectionsAuthority | null> => {
  if (!id) return null;

  try {
    const client = ancillarySubgraphClient(chainId);
    if (!client) return null;
    const response = await client.request<HatElectionResponse>(ELECTION_QUERY, {
      id,
    });

    return response?.hatsElectionEligibility || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching ancillary modules:', error);
    return null;
  }
};

export const fetchHsgSigners = async ({
  hatIds,
  chainId,
}: {
  hatIds: Hex[] | undefined;
  chainId: SupportedChains | undefined;
}) => {
  if (!hatIds || !chainId) return null;

  try {
    const client = ancillarySubgraphClient(chainId);
    if (!client) return null;
    const response: any = await client.request(HSG_SIGNER_QUERY, {
      ids: hatIds,
    });

    return (response?.hatsSignerGates as HatSignerGate[]) || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching ancillary modules:', error);
    return null;
  }
};

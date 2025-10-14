import { gql } from 'graphql-request';

import { NETWORKS_PREFIX } from './constants';

export function getModuleAuthoritiesQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query GetModuleAuthorities($id: ID!) {
      ${networkPrefix}_hatAuthority(id: $id) {
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
          ownerHat {
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
          signerHats {
            id
          }
          ownerHat {
            id
          }
        }
        hsgV2Owner {
          id
          safe
          thresholdType
          minThreshold
          targetThreshold
          signerHats {
            id
          }
          ownerHat {
            id
          }
        }
        hsgV2Signer {
          id
          safe
          thresholdType
          minThreshold
          targetThreshold
          signerHats {
            id
          }
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
}

export function getElectionAuthoritiesQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query GetElectionAuthorities($id: ID!) {
      ${networkPrefix}_hatsElectionEligibility(id: $id) {
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
}

export function getHsgSignersQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query GetHsgSigners($ids: [ID]!) {
      ${networkPrefix}_hatsSignerGateV2S(where: { signerHats_: { id_in: $ids } }) {
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
}

export function getAllowlistEntriesQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query GetAllowlistEligibility($address: String!) {
      ${networkPrefix}_allowListEligibilityDatas(where: { address: $address }) {
        allowListEligibility {
          hatId
        }
      }
    }
  `;
}

export function getCouncilsListQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query CouncilsList($hatIds: [String!]!) {
      ${networkPrefix}_hatsSignerGateV2S(where: { signerHats_: { id_in: $hatIds } }) {
        id
        ownerHat {
          id
        }
        safe
        signerHats {
          id
        }
      }
    }
  `;
}

export function getSafeRegisteredEventsQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query SafeRegisteredEvents($hsg: String!) {
      ${networkPrefix}_hatsSignerGateV2RegisteredEvents(where: { hsg: $hsg }) {
        id
        signer
        timestamp
        hatId
        hsg {
          id
          safe
        }
      }
    }
  `;
}

export function getJokeRaceQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query JokeRaceEligibility($moduleId: String!) {
      ${networkPrefix}_jokeRaceEligibility(id: $moduleId) {
        currentTerm {
          contest
          termEndsAt
          topK
          transitionPeriod
          winners
        }
      }
    }
  `;
}

export function getAgreementEligibilityQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query GetModuleAuthorities($id: ID!) {
      ${networkPrefix}_agreementEligibility(id: $id) {
        agreements(orderBy: graceEndTime, orderDirection: desc, first: 1) {
          graceEndTime
          signers
        }
        badStandings
      }
    }
  `;
}

export function getAllowlistEligibilityQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query GetModuleAuthorities($id: ID!) {
      ${networkPrefix}_allowListEligibility(id: $id) {
        eligibilityData {
          address
          eligible
          badStanding
        }
      }
    }
  `;
}

export function getHatWearingEligibilityQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query GetHatWearingEligibility($id: ID!) {
      ${networkPrefix}_hatWearingEligibility(id: $id) {
        criterionHat
      }
    }
  `;
}

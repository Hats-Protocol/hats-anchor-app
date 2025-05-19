import { gql } from 'graphql-request';

import { NETWORKS_PREFIX } from './constants';

// TODO better pagination on hats
export function getHatsDetailsQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query getHats($ids: [ID!]!) {
      ${networkPrefix}_hats(where: { id_in: $ids }, first: 1000) {
        id
        prettyId
        status
        createdAt
        details
        detailsMetadata
        maxSupply
        eligibility
        toggle
        mutable
        imageUri
        nearestImage
        levelAtLocalTree
        claimableBy {
          id
        }
        claimableForBy {
          id
        }
        currentSupply
        tree {
          id
        }
        wearers(first: 5) {
          id
        }
        admin {
          id
        }
        events(orderBy: timestamp, orderDirection: desc) {
          id
          timestamp
          transactionID
          __typename 
          ... on ${networkPrefix}_HatCreatedEvent { 
            hatDetails 
            hatMaxSupply 
            hatEligibility 
            hatToggle 
            hatMutable 
            hatImageUri 
          } 
          ... on ${networkPrefix}_HatMintedEvent { 
            wearer { 
              id 
            } 
            operator 
          } 
          ... on ${networkPrefix}_HatBurnedEvent { 
            wearer { 
              id 
            } 
            operator 
          } 
          ... on ${networkPrefix}_HatStatusChangedEvent { 
            hatNewStatus 
          } 
          ... on ${networkPrefix}_HatDetailsChangedEvent { 
            hatNewDetails 
          } 
          ... on ${networkPrefix}_HatEligibilityChangedEvent { 
            hatNewEligibility 
          } 
          ... on ${networkPrefix}_HatToggleChangedEvent { 
            hatNewToggle 
          } 
          ... on ${networkPrefix}_HatMaxSupplyChangedEvent { 
            hatNewMaxSupply 
          } 
          ... on ${networkPrefix}_HatImageURIChangedEvent { 
            hatNewImageURI 
          } 
          ... on ${networkPrefix}_TopHatLinkRequestedEvent { 
            newAdmin {
              id
            }
          } 
          ... on ${networkPrefix}_TopHatLinkedEvent { 
            newAdmin {
              id
            }
          } 
          ... on ${networkPrefix}_WearerStandingChangedEvent { 
            wearer { 
              id 
              } 
            wearerStanding 
          } 
        }
      }
    }
  `;
}

export function getPaginatedWearersForHatQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query getPaginatedWearersForHat($hatId: ID!, $first: Int!, $skip: Int!) {
      ${networkPrefix}_hat(id: $hatId) {
        wearers(skip: $skip, first: $first) {
          id
        }
      }
    }
  `;
}

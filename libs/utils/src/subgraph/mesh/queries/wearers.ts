import { gql } from 'graphql-request';

import { NETWORKS_PREFIX } from './constants';

export function getWearerDetailsQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query getCurrentHatsForWearer($id: ID!) {
      ${networkPrefix}_wearer(id: $id) {
        id
        currentHats(first: 1000) {
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
          wearers {
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
    }
  `;
}

export function getWearerTreesQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query getWearerTrees($id: ID!) {
      ${networkPrefix}_wearer(id: $id) {
        id
        currentHats {
          id
          tree {
            id
            hats(first: 1) {
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
              wearers {
                id
              }
              admin {
                id
              }
            }
          }
        }
      
      }
    }
  `;
}

export function getWearersProfileDetailQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query getWearerProfileDetails($ids: [ID!]!) {
      ${networkPrefix}_wearers(where: { id_in: $ids }) {
        id
        ensName
        contractName
        isContract
      }
    }
  `;
}

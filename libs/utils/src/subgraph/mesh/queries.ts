import { gql } from 'graphql-request';

export const NETWORKS_PREFIX: { [key: string]: string } = {
  1: 'Eth',
  11155111: 'Sep',
  10: 'Op',
  100: 'Gno',
  137: 'Pol',
  42220: 'Celo',
  8453: 'Base',
  42161: 'Arb',
};

export function getTreeQuery(chaindId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chaindId];
  return gql`
    query getTree($id: ID!) {
      ${networkPrefix}_tree(id: $id) {
        id
        hats {
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
          wearers(first: 5) {
            id
          }
          admin {
            id
          }
        }
        events(orderBy: timestamp, orderDirection: desc, first: 100) {
          id
          timestamp
          transactionID
          hat {
            id
            prettyId
          }
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
        linkRequestFromTree {
          id
          requestedLinkToHat {
            id
            prettyId
          }
        }
        childOfTree {
          id
        }
        parentOfTrees {
          id
          linkedToHat {
            id
            prettyId
          }
          hats {
            id
            prettyId
          }
        }
        linkedToHat {
          id
          prettyId
          tree {
            id
          }
        }
      }
    }
  `;
}

export function getTreesPaginatedQuery(chaindId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chaindId];
  return gql`
    query getPaginatedTrees($skip: Int!, $first: Int!) {
      ${networkPrefix}_trees(skip: $skip, first: $first) {
        id
        hats(first: 1) {
          id
          details
          imageUri
          detailsMetadata
          prettyId
          admin {
            id
            prettyId
          }
        }
      }
    }
  `;
}

export function getTreesByIdQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query getTreesById($ids: [ID!]!) {
      ${networkPrefix}_trees(where: { id_in: $ids }) {
        id
        hats {
          id
          details
          imageUri
          prettyId
          currentSupply
          admin {
            id
            prettyId
          }
          wearers(first: 5) {
            id
          }
          status
        }
        childOfTree {
          id
        }
        parentOfTrees {
          id
          linkedToHat {
            id
            prettyId
          }
        }
        linkedToHat {
          id
          prettyId
          tree {
            id
          }
        }
      }
    }
  `;
}

export function getHatDetailsQuery(chainId: number): string {
  const networkPrefix = NETWORKS_PREFIX[chainId];
  return gql`
    query getHat($id: ID!) {
      ${networkPrefix}_hat(id: $id) {
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

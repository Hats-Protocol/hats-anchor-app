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
        events(first: 100) {
          id
          timestamp
          transactionID
          hat {
            id
            prettyId
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
        hats {
          id
          details
          imageUri
          prettyId
          wearers(first: 5) {
            id
          }
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
        events {
          id
          timestamp
          transactionID
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
        currentHats(first: 100) {
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
          events {
            id
            timestamp
            transactionID
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

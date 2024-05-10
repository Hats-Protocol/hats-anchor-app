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

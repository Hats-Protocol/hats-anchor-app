import { gql } from 'graphql-request';

export const GET_TREE = gql`
  query getTree($id: ID!) {
    tree(id: $id) {
      id
      hats {
        id
        prettyId
        admin {
          id
          prettyId
        }
      }
      events(orderBy: timestamp, orderDirection: desc) {
        id
        timestamp
        transactionID
      }
    }
  }
`;

export const GET_HAT = gql`
  query getHat($id: ID!) {
    hat(id: $id) {
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
      currentSupply
      wearers {
        id
      }
    }
  }
`;

import { gql } from 'graphql-request';

// TODO handle inline sort for events
export const TREE_DETAILS_FRAGMENT = gql`
  fragment TreeDetails on Tree {
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
`;

export const GET_TREE = gql`
  query getTree($id: ID!) {
    tree(id: $id) {
      ...TreeDetails
    }
  }
  ${TREE_DETAILS_FRAGMENT}
`;

export const GET_ALL_TREE_IDS = gql`
  query getAllTrees {
    trees {
      id
    }
  }
`;

export const GET_ALL_TREES = gql`
  query getAllTrees {
    trees {
      ...TreeDetails
    }
  }
  ${TREE_DETAILS_FRAGMENT}
`;

export const HAT_DETAILS_FRAGMENT = gql`
  fragment HatDetailsUnit on Hat {
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
  }
  fragment HatDetails on Hat {
    ...HatDetailsUnit
    wearers {
      id
    }
    admin {
      ...HatDetailsUnit
    }
  }
`;

export const GET_HAT = gql`
  query getHat($id: ID!) {
    hat(id: $id) {
      ...HatDetails
    }
  }
  ${HAT_DETAILS_FRAGMENT}
`;

export const SEARCH_QUERY = gql`
  query search($search: String!) {
    trees(where: { id: $search }) {
      id
    }
    hats(where: { id: $search }) {
      id
    }
  }
`;

export const GET_WEARER_DETAILS = gql`
  query getCurrentHatsForWearer($id: ID!) {
    wearer(id: $id) {
      currentHats {
        id
        prettyId
        levelAtLocalTree
      }
    }
  }
`;

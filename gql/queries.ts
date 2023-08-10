import { gql } from 'graphql-request';

const EVENT_DETAILS_FRAGMENT = gql`
  fragment EventDetails on HatsEvent {
    id
    timestamp
    transactionID
  }
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
    events(orderBy: timestamp, orderDirection: desc) {
      ...EventDetails
    }
    tree {
      id
    }
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
  ${EVENT_DETAILS_FRAGMENT}
`;

export const GET_HAT = gql`
  query getHat($id: ID!) {
    hat(id: $id) {
      ...HatDetails
    }
  }
  ${HAT_DETAILS_FRAGMENT}
`;

export const GET_HATS_BY_IDS = gql`
  query getHatsByIds($ids: [ID!]!) {
    hats(where: { id_in: $ids }) {
      ...HatDetails
    }
  }
  ${HAT_DETAILS_FRAGMENT}
`;

// TODO handle inline sort for events
export const TREE_DETAILS_FRAGMENT_WITH_EVENTS = gql`
  fragment TreeDetailsWithEvents on Tree {
    id
    hats {
      ...HatDetails
    }
    events(orderBy: timestamp, orderDirection: desc, first: 5) {
      ...EventDetails
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
    }
    linkedToHat {
      id
      prettyId
      tree {
        id
      }
    }
  }
  ${EVENT_DETAILS_FRAGMENT}
  ${HAT_DETAILS_FRAGMENT}
`;

export const TREE_DETAILS_FRAGMENT = gql`
  fragment TreeDetails on Tree {
    id
    hats {
      id
      details
      imageUri
      prettyId
      admin {
        id
        prettyId
      }
      wearers {
        id
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
    }
    linkedToHat {
      id
      prettyId
      tree {
        id
      }
    }
  }
`;

export const TREE_TOP_HAT_DETAILS_FRAGMENT = gql`
  fragment TreeTopHatDetails on Tree {
    id
    hats(first: 1) {
      id
      details
      imageUri
      prettyId
      admin {
        id
        prettyId
      }
    }
  }
`;

export const GET_TREE = gql`
  query getTree($id: ID!) {
    tree(id: $id) {
      ...TreeDetailsWithEvents
    }
  }
  ${TREE_DETAILS_FRAGMENT_WITH_EVENTS}
`;

export const GET_ALL_TREE_IDS = gql`
  query getAllTrees {
    trees {
      id
      hats {
        id
        prettyId
      }
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

export const GET_PAGINATED_TREES = gql`
  query getPaginatedTrees($skip: Int!, $first: Int!) {
    trees(skip: $skip, first: $first) {
      ...TreeTopHatDetails
    }
  }
  ${TREE_TOP_HAT_DETAILS_FRAGMENT}
`;

export const GET_TREES_BY_ID = gql`
  query getTreesById($ids: [ID!]!) {
    trees(where: { id_in: $ids }) {
      ...TreeDetails
    }
  }
  ${TREE_DETAILS_FRAGMENT}
`;

export const SEARCH_QUERY = gql`
  query search($search: String!) {
    trees(where: { id: $search }) {
      id
    }
    hats(where: { or: [{ id: $search }, { prettyId: $search }] }) {
      id
      prettyId
    }
  }
`;

export const GET_WEARER_DETAILS = gql`
  query getCurrentHatsForWearer($id: ID!) {
    wearer(id: $id) {
      currentHats {
        ...HatDetails
      }
    }
  }
  ${HAT_DETAILS_FRAGMENT}
`;

export const GET_ALL_WEARERS = gql`
  query getAllWearers {
    wearers {
      id
    }
  }
`;

export const GET_CONTROLLERS_FOR_USER = gql`
  query getControllersForUser($address: String!) {
    hats(where: { or: [{ toggle: $address }, { eligibility: $address }] }) {
      ...HatDetails
    }
  }
  ${HAT_DETAILS_FRAGMENT}
`;

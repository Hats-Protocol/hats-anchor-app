import { gql } from 'graphql-request';

import {
  EVENT_DETAILS_FRAGMENT,
  HAT_DETAILS_WITHOUT_EVENTS_FRAGMENT,
} from './hat';

// TODO handle inline sort for events
export const TREE_DETAILS_FRAGMENT_WITH_EVENTS = gql`
  fragment TreeDetailsWithEvents on Tree {
    id
    hats {
      ...HatDetailsUnit
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
  ${HAT_DETAILS_WITHOUT_EVENTS_FRAGMENT}
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

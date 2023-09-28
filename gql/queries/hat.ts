import { gql } from 'graphql-request';

export const EVENT_DETAILS_FRAGMENT = gql`
  fragment EventDetails on HatsEvent {
    id
    timestamp
    transactionID
  }
`;

export const HAT_DETAILS_WITHOUT_EVENTS_FRAGMENT = gql`
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
    tree {
      id
    }
    wearers {
      id
    }
    admin {
      id
    }
  }
  ${EVENT_DETAILS_FRAGMENT}
`;

export const HAT_DETAILS_FRAGMENT = gql`
  fragment HatDetails on Hat {
    ...HatDetailsUnit
    events(orderBy: timestamp, orderDirection: desc) {
      ...EventDetails
    }
  }
  ${HAT_DETAILS_WITHOUT_EVENTS_FRAGMENT}
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

import { gql } from 'graphql-request';

import { HAT_DETAILS_FRAGMENT } from './hat';

// todo get wearer hats
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

export const GET_PAGINATED_WEARERS_FOR_HAT = gql`
  query getPaginatedWearersForHat($hatId: ID!, $first: Int!, $skip: Int!) {
    wearers(
      skip: $skip
      first: $first
      where: { currentHats_: { id: $hatId } }
    ) {
      id
    }
  }
`;

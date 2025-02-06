import { gql } from 'graphql-request';

export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    address
    email
    name
    telegram
  }
`;

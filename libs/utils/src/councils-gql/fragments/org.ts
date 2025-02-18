import { gql } from 'graphql-request';

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFragment on Organization {
    id
    name
  }
`;

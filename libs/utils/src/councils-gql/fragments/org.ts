import { gql } from 'graphql-request';

import { COUNCIL_FRAGMENT } from './council';

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFragment on Organization {
    id
    name
  }
`;

export const ORGANIZATION_COUNCIL_FRAGMENT = gql`
  fragment OrganizationCouncilFragment on Organization {
    id
    name
    councils {
      ...CouncilFragment
    }
  }
  ${COUNCIL_FRAGMENT}
`;

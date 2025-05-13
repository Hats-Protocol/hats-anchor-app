import { gql } from 'graphql-request';

import { FORM_FRAGMENT, ORGANIZATION_COUNCIL_FRAGMENT } from './fragments';

export const GET_COUNCIL_FORM = gql`
  query GetCouncilForm($id: ID!) {
    councilCreationForm(id: $id) {
      ...FormFragment
    }
  }
  ${FORM_FRAGMENT}
`;

export const ORGANIZATION_BY_NAME_QUERY = gql`
  query OrganizationByName($name: String!) {
    organizations(where: { name: $name }) {
      ...OrganizationCouncilFragment
    }
  }
  ${ORGANIZATION_COUNCIL_FRAGMENT}
`;

export const GET_USER_ORGANIZATIONS = gql`
  query GetUserOrganizations($userAddress: String!) {
    organizations(where: { userAddress: $userAddress }) {
      ...OrganizationCouncilFragment
    }
  }
  ${ORGANIZATION_COUNCIL_FRAGMENT}
`;

export const ORGANIZATIONS_QUERY = gql`
  query Organizations {
    organizations {
      ...OrganizationCouncilFragment
    }
  }
  ${ORGANIZATION_COUNCIL_FRAGMENT}
`;

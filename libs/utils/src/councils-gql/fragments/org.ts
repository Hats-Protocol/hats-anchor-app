import { gql } from 'graphql-request';

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
      id
      chain
      treeId
      hsg
      creationForm {
        id
        creator
        chain
        councilName
        members {
          id
          name
          address
          email
        }
        admins {
          id
          name
          address
          email
        }
        agreement
        agreementAdmins {
          id
          name
          address
        }
        tokenAmount
        tokenAddress
        complianceAdmins {
          id
          name
          address
        }
      }
    }
  }
`;

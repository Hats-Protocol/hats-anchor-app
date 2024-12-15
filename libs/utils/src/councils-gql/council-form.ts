import { gql } from 'graphql-request';

export const CREATE_INITIAL_FORM = gql`
  mutation CreateInitialForm {
    createCouncilCreationForm(
      thresholdType: ABSOLUTE
      maxCouncilMembers: 7
      thresholdTarget: 4
      thresholdMin: 2
      membersSelectionType: ALLOWLIST
    ) {
      id
    }
  }
`;

export const UPDATE_COUNCIL_FORM = gql`
  mutation UpdateCouncilForm(
    $id: ID!
    $organizationName: String
    $councilName: String
    $chain: Int
    $councilDescription: String
    $membersSelectionType: MemberSelectionType
    $thresholdType: ThresholdType
    $maxCouncilMembers: Int
    $thresholdTarget: Int
    $thresholdMin: Int
    $members: [UserInput!]
    $admins: [UserInput!]
    $complianceAdmins: [UserInput!]
    $createComplianceAdminRole: Boolean!
    $memberRequirements: MemberRequirementsInput!
    $agreement: String
  ) {
    updateCouncilCreationForm(
      id: $id
      organizationName: $organizationName
      councilName: $councilName
      chain: $chain
      councilDescription: $councilDescription
      membersSelectionType: $membersSelectionType
      thresholdType: $thresholdType
      maxCouncilMembers: $maxCouncilMembers
      thresholdTarget: $thresholdTarget
      thresholdMin: $thresholdMin
      members: $members
      admins: $admins
      complianceAdmins: $complianceAdmins
      createComplianceAdminRole: $createComplianceAdminRole
      memberRequirements: $memberRequirements
      agreement: $agreement
    ) {
      id
      organizationName
      councilName
      chain
      councilDescription
      membersSelectionType
      thresholdType
      maxCouncilMembers
      thresholdTarget
      thresholdMin
      members {
        id
        address
        email
        name
      }
      admins {
        id
        address
        email
        name
      }
      complianceAdmins {
        id
        address
        email
        name
      }
      createComplianceAdminRole
      memberRequirements {
        signAgreement
        holdTokens
        passCompliance
      }
      agreement
    }
  }
`;

export const GET_COUNCIL_FORM = gql`
  query GetCouncilForm($id: ID!) {
    councilCreationForm(id: $id) {
      id
      organizationName
      councilName
      chain
      councilDescription
      membersSelectionType
      thresholdType
      maxCouncilMembers
      thresholdTarget
      thresholdMin
      members {
        id
        address
        email
        name
      }
      admins {
        id
        address
        email
        name
      }
      complianceAdmins {
        id
        address
        email
        name
      }
      createComplianceAdminRole
      memberRequirements {
        signAgreement
        holdTokens
        passCompliance
      }
      agreement
    }
  }
`;

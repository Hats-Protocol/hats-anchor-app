import { gql } from 'graphql-request';

export const CREATE_INITIAL_FORM = `
  mutation CreateInitialForm {
    createCouncilCreationForm {
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
    $createComplianceAdminRole: Boolean
    $memberRequirements: MemberRequirementsInput
    $agreement: String
    $createAgreementAdminRole: Boolean
    $agreementAdmins: [UserInput!]
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
      createAgreementAdminRole: $createAgreementAdminRole
      agreementAdmins: $agreementAdmins
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
      createAgreementAdminRole
      agreementAdmins {
        id
        address
        email
        name
      }
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
      createAgreementAdminRole
      agreementAdmins {
        id
        address
        email
        name
      }
    }
  }
`;

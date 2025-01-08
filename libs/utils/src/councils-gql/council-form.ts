import { gql } from 'graphql-request';

export const CREATE_USER = gql`
  mutation CreateUser($address: String!, $email: String!, $name: String) {
    createUser(address: $address, email: $email, name: $name) {
      id
      address
      email
      name
    }
  }
`;

export const CREATE_INITIAL_FORM = gql`
  mutation CreateInitialForm($creator: String, $chain: Int, $admins: [UserInput!]) {
    createCouncilCreationForm(creator: $creator, chain: $chain, admins: $admins) {
      id
      chain
      creator
      admins {
        id
        address
        email
      }
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
    $payer: UserInput
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
      payer: $payer
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
      payer {
        id
        address
        email
        name
        telegram
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
      payer {
        id
        address
        email
        name
        telegram
      }
    }
  }
`;

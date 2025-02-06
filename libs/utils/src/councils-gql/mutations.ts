import { gql } from 'graphql-request';

import { COUNCIL_FRAGMENT, FORM_FRAGMENT, ORGANIZATION_FRAGMENT, USER_FRAGMENT } from './fragments';

export const UPDATE_COUNCIL_FORM = gql`
  mutation UpdateCouncilForm(
    $id: ID!
    $councilId: ID
    $organizationName: String
    $councilName: String
    $chain: Int
    $deployed: Boolean
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
    $tokenAmount: Int
    $tokenAddress: String
  ) {
    updateCouncilCreationForm(
      id: $id
      organizationName: $organizationName
      councilId: $councilId
      councilName: $councilName
      chain: $chain
      deployed: $deployed
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
      tokenAmount: $tokenAmount
      tokenAddress: $tokenAddress
    ) {
      ...FormFragment
    }
  }
  ${FORM_FRAGMENT}
`;

export const CREATE_COUNCIL = gql`
  mutation CreateCouncil(
    $chainId: Int!
    $hsg: String!
    $treeId: Int
    $organizationId: ID!
    $membersSelectionModule: String
    $membersCriteriaModule: String
    $deployed: Boolean!
  ) {
    createCouncil(
      chain: $chainId
      hsg: $hsg
      treeId: $treeId
      organizationId: $organizationId
      membersSelectionModule: $membersSelectionModule
      membersCriteriaModule: $membersCriteriaModule
      deployed: $deployed
    ) {
      ...CouncilFragment
    }
  }
  ${COUNCIL_FRAGMENT}
`;

export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($name: String!) {
    createOrganization(name: $name) {
      ...OrganizationFragment
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

export const UPDATE_PAYER = gql`
  mutation UpdateCouncilCreationForm($id: ID!, $payer: UserInput!) {
    updateCouncilCreationForm(id: $id, payer: $payer) {
      id
      payer {
        ...UserFragment
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const CREATE_USER = gql`
  mutation CreateUser($address: String!, $email: String!, $name: String, $telegram: String) {
    createUser(address: $address, email: $email, name: $name, telegram: $telegram) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $address: String!, $email: String!, $name: String, $telegram: String) {
    updateUser(id: $id, address: $address, email: $email, name: $name, telegram: $telegram) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const UPDATE_COUNCIL_MEMBERS = gql`
  mutation updateCouncilMembers($id: ID!, $members: [UserInput!]) {
    updateCouncilCreationForm(id: $id, members: $members) {
      ...FormFragment
    }
  }
  ${FORM_FRAGMENT}
`;

export const UPDATE_COUNCIL_ADMINS = gql`
  mutation updateCouncilAdmins($id: ID!, $admins: [UserInput!]) {
    updateCouncilCreationForm(id: $id, admins: $admins) {
      ...FormFragment
    }
  }
  ${FORM_FRAGMENT}
`;

export const UPDATE_COUNCIL_COMPLIANCE_ADMINS = gql`
  mutation updateCouncilComplianceAdmins($id: ID!, $complianceAdmins: [UserInput!]) {
    updateCouncilCreationForm(id: $id, complianceAdmins: $complianceAdmins) {
      ...FormFragment
    }
  }
  ${FORM_FRAGMENT}
`;

export const UPDATE_COUNCIL_AGREEMENT_ADMINS = gql`
  mutation updateCouncilAgreementAdmins($id: ID!, $agreementAdmins: [UserInput!]) {
    updateCouncilCreationForm(id: $id, agreementAdmins: $agreementAdmins) {
      ...FormFragment
    }
  }
  ${FORM_FRAGMENT}
`;

export const CREATE_INITIAL_FORM = gql`
  mutation CreateInitialForm($creator: String, $chain: Int, $admins: [UserInput!]) {
    createCouncilCreationForm(creator: $creator, chain: $chain, admins: $admins) {
      id
      chain
      creator
      admins {
        ...UserFragment
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const UPDATE_COUNCIL = gql`
  mutation UpdateCouncil($id: ID!, $deployed: Boolean!) {
    updateCouncil(id: $id, deployed: $deployed) {
      id
      deployed
    }
  }
`;

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
  mutation UpdateCouncilCreationForm(
    $id: ID!
    $thresholdType: ThresholdType
    $maxCouncilMembers: Int
    $thresholdTarget: Int
    $thresholdMin: Int
    $organizationName: String
    $councilName: String
    $councilDescription: String
    $chain: Int
    $membersSelectionType: MemberSelectionType
    $membersAllowlist: AllowlistInput
    $agreementCriteria: AgreementInput
    $tokenCriteria: TokenInput
    $kycCriteria: KycInput
  ) {
    updateCouncilCreationForm(
      id: $id
      thresholdType: $thresholdType
      maxCouncilMembers: $maxCouncilMembers
      thresholdTarget: $thresholdTarget
      thresholdMin: $thresholdMin
      organizationName: $organizationName
      councilName: $councilName
      councilDescription: $councilDescription
      chain: $chain
      membersSelectionType: $membersSelectionType
      membersAllowlist: $membersAllowlist
      agreementCriteria: $agreementCriteria
      tokenCriteria: $tokenCriteria
      kycCriteria: $kycCriteria
    ) {
      id
      organizationName
      councilName
      councilDescription
      thresholdType
      maxCouncilMembers
      thresholdTarget
      thresholdMin
      chain
      membersSelectionType
      membersAllowlist {
        admins
        members
      }
      agreementCriteria {
        agreement
      }
      tokenCriteria {
        id
      }
      kycCriteria {
        verifiers
      }
    }
  }
`;

export const GET_COUNCIL_FORM = gql`
  query GetCouncilForm($id: ID!) {
    councilCreationForm(id: $id) {
      id
      thresholdType
      maxCouncilMembers
      thresholdTarget
      thresholdMin
      organizationName
      councilName
      councilDescription
      membersSelectionType
      chain
      membersAllowlist {
        admins
        members
      }
      agreementCriteria {
        agreement
      }
      tokenCriteria {
        id
      }
      kycCriteria {
        verifiers
      }
    }
  }
`;

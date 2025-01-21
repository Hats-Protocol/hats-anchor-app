import { gql } from 'graphql-request';

import { USER_FRAGMENT } from './user';
export const FORM_FRAGMENT = gql`
  fragment FormFragment on CouncilCreationForm {
    id
    organizationName
    councilName
    chain
    councilDescription
    creator
    membersSelectionType
    thresholdType
    maxCouncilMembers
    thresholdTarget
    thresholdMin
    members {
      ...UserFragment
    }
    admins {
      ...UserFragment
    }
    complianceAdmins {
      ...UserFragment
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
      ...UserFragment
    }
    payer {
      ...UserFragment
      telegram
    }
    tokenAmount
    tokenAddress
  }
  ${USER_FRAGMENT}
`;

import { gql } from 'graphql-request';

import { COUNCIL_FRAGMENT } from './council';
// import { USER_FRAGMENT } from './user';

export const FORM_FRAGMENT = gql`
  fragment FormFragment on CouncilCreationForm {
    id
    organizationName
    # Details
    councilName
    chain
    councilDescription
    creator
    membersSelectionType
    # Threshold
    thresholdType
    maxCouncilMembers
    thresholdTarget
    thresholdMin
    # Eligibility
    eligibilityRequirements
    completedOptionalSteps
    # Relationships
    members {
      ...UserFragment
    }
    admins {
      ...UserFragment
    }
    complianceAdmins {
      ...UserFragment
    }
    agreementAdmins {
      ...UserFragment
    }
    payer {
      ...UserFragment
    }

    # Council relationship
    council {
      ...CouncilFragment
    }
    # Deprecated
    tokenAmount
    tokenAddress
    createComplianceAdminRole
    memberRequirements {
      signAgreement
      holdTokens
      passCompliance
    }
    agreement
    createAgreementAdminRole
  }
  ${COUNCIL_FRAGMENT}
`;

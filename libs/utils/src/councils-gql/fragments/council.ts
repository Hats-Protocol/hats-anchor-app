import { gql } from 'graphql-request';

import { USER_FRAGMENT } from './user';

export const COUNCIL_FRAGMENT = gql`
  fragment CouncilFragment on Council {
    id
    treeId
    organization {
      id
    }
    membersSelectionModule
    membersCriteriaModule
    deployed
    creationForm {
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
  }
  ${USER_FRAGMENT}
`;

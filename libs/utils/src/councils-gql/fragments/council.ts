import { gql } from 'graphql-request';

import { USER_FRAGMENT } from './user';

export const COUNCIL_FRAGMENT = gql`
  fragment CouncilFragment on Council {
    id
    treeId
    organization {
      id
      name
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

// TODO support safe or id
export const GET_COUNCIL_BY_HSG = gql`
  query getCouncilByHsg($hsg: String, $chainId: Int!) {
    councils(where: { hsg: $hsg, chain: $chainId }) {
      ...CouncilFragment
    }
  }
  ${COUNCIL_FRAGMENT}
`;

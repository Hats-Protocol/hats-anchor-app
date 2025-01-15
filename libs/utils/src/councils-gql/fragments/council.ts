import { gql } from 'graphql-request';

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
  }
`;

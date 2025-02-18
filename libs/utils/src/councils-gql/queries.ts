import { gql } from 'graphql-request';

import { FORM_FRAGMENT } from './fragments';

export const GET_COUNCIL_FORM = gql`
  query GetCouncilForm($id: ID!) {
    councilCreationForm(id: $id) {
      ...FormFragment
    }
  }
  ${FORM_FRAGMENT}
`;

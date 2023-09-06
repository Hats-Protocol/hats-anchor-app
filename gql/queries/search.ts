/* eslint-disable import/prefer-default-export */
import { gql } from 'graphql-request';

export const SEARCH_QUERY = gql`
  query search($search: String!) {
    trees(where: { id: $search }) {
      id
    }
    hats(where: { or: [{ id: $search }, { prettyId: $search }] }) {
      id
      prettyId
    }
  }
`;

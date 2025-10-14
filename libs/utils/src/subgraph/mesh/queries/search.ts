import { gql } from 'graphql-request';

import { NETWORKS_PREFIX } from './constants';

export function getCrossChainSearchQuery(): string {
  const networkQueries = Object.entries(NETWORKS_PREFIX)
    .map(
      ([, prefix]) => `
      ${prefix}_trees(where: { id: $searchId }) {
        id
      }
      ${prefix}_hats(where: { or: [{ id: $searchId }, { prettyId: $searchString }] }) {
        id
        prettyId
        tree {
          id
        }
      }
      ${prefix}_wearers(where: { id: $searchId }) {
        id
      }
    `,
    )
    .join('\n');

  return gql`
    query CrossChainSearch($searchId: ID!, $searchString: String!) {
      ${networkQueries}
    }
  `;
}

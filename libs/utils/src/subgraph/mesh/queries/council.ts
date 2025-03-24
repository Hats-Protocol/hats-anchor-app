import { gql } from 'graphql-request';

import { NETWORKS_PREFIX } from './constants';

// explicitly query all chains for council data
export const getCrossChainCouncilsListDataQuery = () => gql`
  query GetCrossChainCouncilsData($hatIds: [ID!]!) {
    Sep_hatsSignerGateV2S(where: { signerHats_: { id_in: $hatIds } }) {
      id
      safe
      signerHats {
        id
      }
    }
    Op_hatsSignerGateV2S(where: { signerHats_: { id_in: $hatIds } }) {
      id
      safe
      signerHats {
        id
      }
    }
    Arb_hatsSignerGateV2S(where: { signerHats_: { id_in: $hatIds } }) {
      id
      safe
      signerHats {
        id
      }
    }
    Base_hatsSignerGateV2S(where: { signerHats_: { id_in: $hatIds } }) {
      id
      safe
      signerHats {
        id
      }
    }
    Celo_hatsSignerGateV2S(where: { signerHats_: { id_in: $hatIds } }) {
      id
      safe
      signerHats {
        id
      }
    }
    Gno_hatsSignerGateV2S(where: { signerHats_: { id_in: $hatIds } }) {
      id
      safe
      signerHats {
        id
      }
    }
    Pol_hatsSignerGateV2S(where: { signerHats_: { id_in: $hatIds } }) {
      id
      safe
      signerHats {
        id
      }
    }
  }
`;

// map over all available networks in NETWORKS_PREFIX for council data
export const getCrossChainCouncilsListDataQueryDynamic = () => {
  const networkQueries = Object.values(NETWORKS_PREFIX)
    .filter((prefix) => prefix !== 'Eth') // Excluding Ethereum as per the example
    .map(
      (prefix) => `
      ${prefix}_hatsSignerGateV2S(where: { signerHats_: { id_in: $hatIds } }) {
        id
        safe
        signerHats {
          id
        }
      }
    `,
    )
    .join('\n');

  return gql`
    query GetCrossChainCouncilsData($hatIds: [ID!]!) {
      ${networkQueries}
    }
  `;
};

import { GraphQLClient } from 'graphql-request';
import { HatSignerGateV2 } from 'types';

import { logger } from '../../../logs';
import { getCrossChainCouncilsListDataQuery, getCrossChainCouncilsListDataQueryDynamic } from '../queries';

interface CrossChainCouncilsResponse {
  Eth_hatsSignerGateV2S: HatSignerGateV2[];
  Sep_hatsSignerGateV2S: HatSignerGateV2[];
  Op_hatsSignerGateV2S: HatSignerGateV2[];
  Arb_hatsSignerGateV2S: HatSignerGateV2[];
  Base_hatsSignerGateV2S: HatSignerGateV2[];
  BaseSep_hatsSignerGateV2S: HatSignerGateV2[];
  Celo_hatsSignerGateV2S: HatSignerGateV2[];
  Gno_hatsSignerGateV2S: HatSignerGateV2[];
  Pol_hatsSignerGateV2S: HatSignerGateV2[];
}

// TODO should take in hatIds per network
export const getCrossChainCouncilsListData = async (hatIds?: string[], useDynamicQuery = false) => {
  if (!hatIds?.length) return null;

  try {
    const client = new GraphQLClient(`${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string);
    const query = useDynamicQuery ? getCrossChainCouncilsListDataQueryDynamic() : getCrossChainCouncilsListDataQuery();

    const response = await client.request<CrossChainCouncilsResponse>(query, {
      hatIds: hatIds,
    });

    // check if any of the chain responses have data and match the response format of nested arrays
    const hasData = Object.entries(response).some(([key, value]) => {
      return value?.length > 0;
    });

    if (!hasData) {
      logger.info('No data found in any chain');
    }

    return response;
  } catch (error) {
    logger.error('Error fetching cross-chain councils data:', error);
    return null;
  }
};

import { GraphQLClient } from 'graphql-request';
import { get } from 'lodash';
import { HatSignerGateV2 } from 'types';

import { logger } from '../../../logs';
import { getCrossChainCouncilsListDataQuery, getCrossChainCouncilsListDataQueryDynamic } from '../queries';
import { NETWORKS_PREFIX } from '../queries/constants';

interface CrossChainCouncilsResponse {
  Sep_hatsSignerGateV2S: HatSignerGateV2[];
  Op_hatsSignerGateV2S: HatSignerGateV2[];
  Arb_hatsSignerGateV2S: HatSignerGateV2[];
  Base_hatsSignerGateV2S: HatSignerGateV2[];
  Celo_hatsSignerGateV2S: HatSignerGateV2[];
  Gno_hatsSignerGateV2S: HatSignerGateV2[];
  Pol_hatsSignerGateV2S: HatSignerGateV2[];
}

interface HatIdObject {
  hatId: string;
}

type HatId = string | HatIdObject;

export const getCrossChainCouncilsListData = async (hatIds?: HatId[], useDynamicQuery = false) => {
  if (!hatIds?.length) return null;

  try {
    const client = new GraphQLClient(`${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string);
    const query = useDynamicQuery ? getCrossChainCouncilsListDataQueryDynamic() : getCrossChainCouncilsListDataQuery();

    // Handle both string and object hat IDs
    const processedHatIds = hatIds.map((id) => {
      if (typeof id === 'string') return id;
      if (typeof id === 'object' && 'hatId' in id) return id.hatId;
      return id;
    });

    logger.info('Querying councils with hatIds:', processedHatIds);
    logger.info('Using dynamic query:', useDynamicQuery);
    logger.info('Query:', query);

    const response = await client.request<CrossChainCouncilsResponse>(query, {
      hatIds: processedHatIds,
    });

    logger.info('try block in fetch councils: response', response);

    // Check if any of the chain responses have data
    const hasData = Object.entries(response).some(([key, value]) => {
      logger.info('try block in fetch councils: hasData', value);
      return value?.length > 0;
    });

    if (!hasData) {
      logger.info('No data found in any chain');
    }

    const result = {
      Sep_hatsSignerGateV2S: get(response, 'Sep_hatsSignerGateV2S', []) as HatSignerGateV2[],
      Op_hatsSignerGateV2S: get(response, 'Op_hatsSignerGateV2S', []) as HatSignerGateV2[],
      Arb_hatsSignerGateV2S: get(response, 'Arb_hatsSignerGateV2S', []) as HatSignerGateV2[],
      Base_hatsSignerGateV2S: get(response, 'Base_hatsSignerGateV2S', []) as HatSignerGateV2[],
      Celo_hatsSignerGateV2S: get(response, 'Celo_hatsSignerGateV2S', []) as HatSignerGateV2[],
      Gno_hatsSignerGateV2S: get(response, 'Gno_hatsSignerGateV2S', []) as HatSignerGateV2[],
      Pol_hatsSignerGateV2S: get(response, 'Pol_hatsSignerGateV2S', []) as HatSignerGateV2[],
    };

    logger.info('final result', result);
    return result;
  } catch (error) {
    logger.error('Error fetching cross-chain councils data:', error);
    return null;
  }
};

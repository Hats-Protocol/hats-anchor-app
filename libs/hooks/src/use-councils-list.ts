import { useQuery } from '@tanstack/react-query';
import { get, isEmpty } from 'lodash';
import { ExtendedHSGV2, SupportedChains } from 'types';
import { createMeshClient, getCouncilsListQuery, logger, NETWORKS_PREFIX } from 'utils';
import { Hex } from 'viem';

const fetchCouncilsList = async (hatIds: Hex[], chainId: number | undefined) => {
  if (!chainId) return Promise.resolve(null);

  try {
    const client = createMeshClient();
    const query = getCouncilsListQuery(chainId);
    const variables = { hatIds };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await client.request(query, variables);

    const networkPrefix = NETWORKS_PREFIX[chainId];
    return Promise.resolve((get(result, `${networkPrefix}_hatsSignerGateV2S`) || null) as ExtendedHSGV2[] | null);
  } catch (error) {
    logger.error('Error fetching councils list:', error);
    return Promise.resolve(null);
  }
};

const useCouncilsList = ({ hatIds, chainId }: UseCouncilsListProps) => {
  return useQuery({
    queryKey: ['councils', { hatIds, chainId }],
    queryFn: () => fetchCouncilsList(hatIds, chainId),
    enabled: !isEmpty(hatIds) && !!chainId,
  });
};

interface UseCouncilsListProps {
  hatIds: Hex[];
  chainId: number | undefined;
}

export { useCouncilsList };

import { useQuery } from '@tanstack/react-query';
import { get } from 'lodash';
import { ExtendedHSGV2, SupportedChains } from 'types';
import { createMeshClient, getSafeRegisteredEventsQuery, logger, NETWORKS_PREFIX } from 'utils';
import { Hex } from 'viem';

const fetchSafeRegisteredEvents = async (hsg: Hex, chainId: number | undefined) => {
  if (!chainId) return Promise.resolve(null);

  try {
    const client = createMeshClient();
    const query = getSafeRegisteredEventsQuery(chainId);
    const variables = { hsg };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await client.request(query, variables);

    const networkPrefix = NETWORKS_PREFIX[chainId];
    return Promise.resolve(
      (get(result, `${networkPrefix}_hatsSignerGateV2RegisteredEvents`) || null) as ExtendedHSGV2[] | null,
    );
  } catch (error) {
    logger.error('Error in fetchSafeRegisteredEvents:', error);
    return Promise.resolve(null);
  }
};

const useSafeRegisteredEvents = ({ hsg, chainId }: UseSafeRegisteredEventsProps) => {
  return useQuery({
    queryKey: ['safeRegisteredEvents', { hsg, chainId }],
    queryFn: () => fetchSafeRegisteredEvents(hsg, chainId),
    enabled: !!hsg && !!chainId,
  });
};

interface UseSafeRegisteredEventsProps {
  hsg: Hex;
  chainId: number | undefined;
}

export { useSafeRegisteredEvents };

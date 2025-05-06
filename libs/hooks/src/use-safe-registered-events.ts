import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { get } from 'lodash';
import { ExtendedHSGV2, SupportedChains } from 'types';
import { ancillarySubgraphClient, logger } from 'utils';
import { Hex } from 'viem';

const SAFE_REGISTERED_EVENTS_QUERY = gql`
  query SafeRegisteredEvents($hsg: String!) {
    hatsSignerGateV2RegisteredEvents(where: { hsg: $hsg }) {
      id
      signer
      timestamp
      hatId
      hsg {
        id
        safe
      }
    }
  }
`;

const fetchSafeRegisteredEvents = async (hsg: Hex, chainId: number | undefined) => {
  if (!chainId) return Promise.resolve(null);

  const client = ancillarySubgraphClient(chainId as SupportedChains);

  if (!client) return Promise.resolve(null);
  const variables = { hsg };

  try {
    const result = await client.request(SAFE_REGISTERED_EVENTS_QUERY, variables);

    return Promise.resolve((get(result, 'hatsSignerGateV2RegisteredEvents') || null) as ExtendedHSGV2[] | null);
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

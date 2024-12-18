import { ANCILLARY_API_URL, NETWORK_ENDPOINTS } from '@hatsprotocol/constants';
import { useQuery } from '@tanstack/react-query';
import { gql, GraphQLClient } from 'graphql-request';
import { get, toNumber } from 'lodash';
import { SupportedChains } from 'types';
import { viemPublicClient } from 'utils';

const OUT_OF_SYNC_THRESHOLD = 50;

const SUBGRAPH_BLOCK_QUERY = gql`
  query SubgraphBlockQuery {
    _meta {
      block {
        number
      }
    }
  }
`;

const fetchSubgraphCheck = async (chainId: number) => {
  const ancillaryApiUrl = ANCILLARY_API_URL[chainId as SupportedChains];
  if (!chainId || !ancillaryApiUrl) return;

  const mainSubgraphClient = new GraphQLClient(
    NETWORK_ENDPOINTS[chainId].endpoint,
  );
  const mainSubgraphPromise = mainSubgraphClient.request(SUBGRAPH_BLOCK_QUERY);

  const ancillarySubgraphClient = new GraphQLClient(ancillaryApiUrl);
  const ancillarySubgraphPromise =
    ancillarySubgraphClient.request(SUBGRAPH_BLOCK_QUERY);

  const chainPromise = viemPublicClient(chainId).getBlock();

  const [mainSubgraph, ancillarySubgraph, chain] = await Promise.all([
    mainSubgraphPromise,
    ancillarySubgraphPromise,
    chainPromise,
  ]);

  const chainNumber = toNumber(get(chain, 'number').toString());
  const mainSubgraphNumber = get(mainSubgraph, '_meta.block.number');
  const ancillarySubgraphNumber = get(ancillarySubgraph, '_meta.block.number');

  return {
    mainSubgraph: mainSubgraphNumber,
    mainSubgraphOutOfSync:
      mainSubgraphNumber &&
      chain &&
      chainNumber - mainSubgraphNumber > OUT_OF_SYNC_THRESHOLD,
    ancillarySubgraph: ancillarySubgraphNumber,
    ancillarySubgraphOutOfSync:
      ancillarySubgraphNumber &&
      chain &&
      chainNumber - ancillarySubgraphNumber > OUT_OF_SYNC_THRESHOLD,
    chain: chainNumber,
  };
};

export const useSubgraphCheck = (chainId: number) => {
  return useQuery({
    queryKey: ['subgraphCheck', chainId],
    queryFn: () => fetchSubgraphCheck(chainId),
  });
};

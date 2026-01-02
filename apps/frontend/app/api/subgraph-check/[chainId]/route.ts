import { ANCILLARY_API_URL, NETWORK_ENDPOINTS } from '@hatsprotocol/config';
import { gql, GraphQLClient } from 'graphql-request';
import { get, last, split, toNumber } from 'lodash';
import { SupportedChains } from 'types';
import { logger, viemPublicClient } from 'utils';

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

interface SubgraphCheckResult {
  mainSubgraph: number | undefined;
  mainSubgraphOutOfSync: boolean;
  mainVersion: string | undefined;
  ancillarySubgraph: number | undefined;
  ancillarySubgraphOutOfSync: boolean;
  ancillaryVersion: string | undefined;
  chain: number;
}

export async function GET(request: Request, { params }: { params: Promise<{ chainId: string }> }): Promise<Response> {
  try {
    const { chainId: chainIdStr } = await params;

    if (!/^\d+$/.test(chainIdStr)) {
      return Response.json({ error: 'Invalid chainId parameter' }, { status: 400 });
    }

    const chainId = parseInt(chainIdStr);

    const ancillaryApiUrl = ANCILLARY_API_URL[chainId as SupportedChains];
    if (!ancillaryApiUrl) {
      return Response.json({ error: 'Unsupported chain' }, { status: 400 });
    }

    const subgraphApiUrl = NETWORK_ENDPOINTS[chainId].endpoint;
    const authToken = process.env.SUBGRAPH_NETWORK_KEY;

    const mainSubgraphClient = new GraphQLClient(subgraphApiUrl, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
    const mainSubgraphPromise = mainSubgraphClient.request(SUBGRAPH_BLOCK_QUERY).catch((err) => {
      logger.error(err);
      return null;
    });

    const ancillarySubgraphClient = new GraphQLClient(ancillaryApiUrl, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
    const ancillarySubgraphPromise = ancillarySubgraphClient.request(SUBGRAPH_BLOCK_QUERY).catch((err) => {
      logger.error(err);
      return null;
    });

    const chainPromise = viemPublicClient(chainId).getBlockNumber();

    const [mainSubgraph, ancillarySubgraph, chain] = await Promise.all([
      mainSubgraphPromise,
      ancillarySubgraphPromise,
      chainPromise,
    ]);

    const chainNumber = toNumber(chain?.toString());
    const mainSubgraphNumber = get(mainSubgraph, '_meta.block.number');
    const ancillarySubgraphNumber = get(ancillarySubgraph, '_meta.block.number');

    const result: SubgraphCheckResult = {
      mainSubgraph: mainSubgraphNumber,
      mainSubgraphOutOfSync: Boolean(
        mainSubgraphNumber && chain && chainNumber - mainSubgraphNumber > OUT_OF_SYNC_THRESHOLD,
      ),
      mainVersion: last(split(subgraphApiUrl, '/')),
      ancillarySubgraph: ancillarySubgraphNumber,
      ancillarySubgraphOutOfSync: Boolean(
        ancillarySubgraphNumber && chain && chainNumber - ancillarySubgraphNumber > OUT_OF_SYNC_THRESHOLD,
      ),
      ancillaryVersion: last(split(ancillaryApiUrl, '/')),
      chain: chainNumber,
    };

    return Response.json(result, { status: 200 });
  } catch (error) {
    logger.error('Subgraph check error:', error);
    return Response.json({ error: 'Failed to check subgraph status' }, { status: 500 });
  }
}

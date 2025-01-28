import { NETWORK_ENDPOINTS } from '@hatsprotocol/config';
import { gql, GraphQLClient } from 'graphql-request';
import { get, toNumber, toString } from 'lodash';
import { TransactionReceipt } from 'viem';

import { useToast } from './use-toast';

const SUBGRAPH_WAIT_TIMEOUT = 20_000; // 20 seconds

const quickSubgraphClient = (chainId: number) => {
  const networkEndpoint = NETWORK_ENDPOINTS[chainId];
  const client = new GraphQLClient(get(networkEndpoint, 'endpoint'));
  return client;
};

const fetchSubgraphBlockNumber = async (chainId: number) => {
  const subgraphClient = quickSubgraphClient(chainId);

  const query = gql`
    query {
      _meta {
        block {
          number
        }
      }
    }
  `;

  const data = await subgraphClient.request(query);
  return get(data, '_meta.block.number', null);
};

const useWaitForSubgraph = ({
  chainId,
  sendToast = false,
  interval = 1000,
}: {
  chainId: number | undefined;
  sendToast?: boolean;
  interval?: number;
}) => {
  const { toast } = useToast();

  const waitForBlock = async (data: TransactionReceipt | undefined) =>
    new Promise((resolve, reject) => {
      const blockNumber = toNumber(toString(get(data, 'blockNumber')));

      const checkBlockHandler = async () => {
        if (!chainId || !blockNumber) {
          return reject(new Error('No chainId or blockNumber'));
        }

        return fetchSubgraphBlockNumber(chainId)
          .then((subgraphBlockNumber) => {
            if (!subgraphBlockNumber || subgraphBlockNumber < blockNumber) {
              return;
            }

            clearInterval(intervalId);

            toast({
              title: 'Subgraph updated!',
            });
            return resolve(subgraphBlockNumber);
          })
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e);
            toast({
              title: 'Error',
              description: 'An error occurred while waiting for subgraph',
              variant: 'destructive',
            });
            clearInterval(intervalId);
            return reject(e);
          });
      };

      const intervalId = setInterval(checkBlockHandler, interval);
      checkBlockHandler();

      if (sendToast) {
        toast({
          title: 'Waiting for subgraph...',
        });
      }

      setTimeout(() => {
        clearInterval(intervalId);
        return reject(new Error('Subgraph wait timeout'));
      }, SUBGRAPH_WAIT_TIMEOUT);
    });

  return waitForBlock;
};

export { useWaitForSubgraph };

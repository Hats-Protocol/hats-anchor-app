import { NETWORK_ENDPOINTS } from '@hatsprotocol/constants';
import { gql, GraphQLClient } from 'graphql-request';
import { get, toNumber, toString } from 'lodash';
import { TransactionReceipt } from 'viem';

import useToast from './useToast';

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
  return data;
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
  const toast = useToast();

  const waitForResult = async (data: TransactionReceipt | undefined) =>
    new Promise((resolve, reject) => {
      const blockNumber = toNumber(toString(get(data, 'blockNumber')));

      const checkResultHandler = async () => {
        if (!chainId || !blockNumber) {
          return reject(new Error('No chainId or blockNumber'));
        }

        return fetchSubgraphBlockNumber(chainId)
          .then((result) => {
            const subgraphBlockNumber = get(result, '_meta.block.number');
            console.log({ subgraphBlockNumber, blockNumber });

            if (subgraphBlockNumber && subgraphBlockNumber >= blockNumber) {
              clearInterval(intervalId);

              toast.success({
                title: 'Subgraph updated!',
              });
              return resolve(result);
            }
          })
          .catch((e) => {
            console.log(e);
            toast.error({
              title: 'Error',
              description: 'An error occurred while waiting for subgraph',
            });
            clearInterval(intervalId);
            return reject(e);
          });
      };

      const intervalId = setInterval(checkResultHandler, interval);
      checkResultHandler();

      if (sendToast) {
        toast.info({
          title: 'Waiting for subgraph...',
        });
      }

      setTimeout(() => {
        clearInterval(intervalId);
        return reject(new Error('Subgraph wait timeout'));
      }, SUBGRAPH_WAIT_TIMEOUT);
    });

  return waitForResult;
};

export default useWaitForSubgraph;

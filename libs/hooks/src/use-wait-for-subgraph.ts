import { get, toNumber, toString } from 'lodash';
import { TransactionReceipt } from 'viem';

import { useToast } from './use-toast';

const SUBGRAPH_WAIT_TIMEOUT = 20_000; // 20 seconds

const fetchSubgraphBlockNumber = async (chainId: number) => {
  const response = await fetch(`/api/subgraph-check/${chainId}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return get(data, 'mainSubgraph', null);
};

const useWaitForSubgraph = ({
  chainId,
  sendToast = false,
  interval = 1000,
  waitTimeout = SUBGRAPH_WAIT_TIMEOUT,
}: {
  chainId: number | undefined;
  sendToast?: boolean;
  interval?: number;
  waitTimeout?: number;
}) => {
  const { toast } = useToast();

  const waitForBlock = async (data: TransactionReceipt | undefined) =>
    new Promise((resolve, reject) => {
      const blockNumber = toNumber(toString(get(data, 'blockNumber')));
      let lastSeenSubgraphBlock: number | null = null;

      const checkBlockHandler = async () => {
        if (!chainId || !blockNumber) {
          return reject(new Error('No chainId or blockNumber'));
        }

        return fetchSubgraphBlockNumber(chainId)
          .then((subgraphBlockNumber) => {
            const subgraphBlock = toNumber(toString(subgraphBlockNumber));
            lastSeenSubgraphBlock = subgraphBlock;

            if (!subgraphBlock || subgraphBlock < blockNumber) {
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

        const timeoutMessage = `Subgraph wait timeout - waiting for block ${blockNumber}${lastSeenSubgraphBlock ? `, last seen block ${lastSeenSubgraphBlock}` : ''}`;

        toast({
          title: 'Subgraph sync timeout',
          description: `Waited ${waitTimeout / 1000}s for subgraph to reach block ${blockNumber}. Last seen: ${lastSeenSubgraphBlock || 'unknown'}`,
          variant: 'destructive',
        });

        return reject(new Error(timeoutMessage));
      }, waitTimeout);
    });

  return waitForBlock;
};

export { useWaitForSubgraph };

import { logger } from '../../logs';

export const invalidateAfterTransaction = async (networkId: number, transactionId: `0x${string}`) => {
  return fetch(`${process.env.NEXT_PUBLIC_MESH_API}/invalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transactionId,
      networkId: networkId.toString(),
      waitForCompletion: true, // Wait for cache invalidation to complete
    }),
  })
    .then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        // Log if we had to wait
        if (data.waitedMs) {
          logger.info(`Cache invalidation completed after ${data.waitedMs}ms for tx ${transactionId}`);
        }
        return data;
      }
      return Promise.resolve(res);
    })
    .catch((e) => {
      logger.error('Error invalidating transaction', e);
      return Promise.resolve(undefined);
    });
};

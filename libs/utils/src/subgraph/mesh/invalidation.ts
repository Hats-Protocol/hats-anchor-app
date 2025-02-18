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
    }),
  })
    .then((res) => Promise.resolve(res.json()))
    .catch((e) => {
      logger.error('Error invalidating transaction', e);
      return Promise.resolve(undefined);
    });
};

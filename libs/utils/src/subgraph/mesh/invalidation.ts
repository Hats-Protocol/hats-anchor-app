import axios from 'axios';

export const invalidateAfterTransaction = async (
  networkId: number,
  transactionId: `0x${string}`,
) => {
  try {
    await axios.post(`${process.env.NEXT_PUBLIC_MESH_API}/invalidate`, {
      transactionId,
      networkId,
    });
  } catch (e) {
    console.error('Error invalidating transaction', e);
  }
};

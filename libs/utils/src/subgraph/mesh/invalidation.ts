export const invalidateAfterTransaction = async (networkId: number, transactionId: `0x${string}`) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_MESH_API}/invalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
        networkId: networkId.toString(),
      }),
    });
  } catch (e) {
    console.error('Error invalidating transaction', e);
  }
};

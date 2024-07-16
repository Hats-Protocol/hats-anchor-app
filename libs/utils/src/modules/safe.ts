import SafeApiKit from '@safe-global/api-kit';

export const createSafeApiKit = (chainId: bigint) => {
  return new SafeApiKit({
    chainId,
    // txServiceUrl: ''
  });
};

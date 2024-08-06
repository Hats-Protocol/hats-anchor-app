import { TKN_ABI } from '@hatsprotocol/constants';

import { viemPublicClient } from './web3';

const tknAddress = '0xc11BA824ab2cEA5E701831AB87ed43eb013902Dd';

export const fetchTokenData = async ({
  symbol,
  chainId,
}: {
  symbol: string;
  chainId?: number | undefined;
}) => {
  const viemClient = viemPublicClient(1);

  const tokenData = await viemClient.readContract({
    address: tknAddress,
    abi: TKN_ABI,
    functionName: 'infoFor',
    args: [symbol],
  });

  return tokenData;
};

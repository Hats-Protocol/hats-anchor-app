import { NETWORK_CURRENCY_IMAGE, TKN_ABI } from '@hatsprotocol/constants';
import { MANUAL_EXCLUDE_TOKENS } from '@hatsprotocol/constants';
import { eq, filter, get, includes, reject, toLower } from 'lodash';

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

export const symbolPriceHandler = (symbol: string) => {
  if (!symbol) return undefined;
  if (
    eq(toLower(symbol), toLower('xDai')) ||
    eq(toLower(symbol), toLower('WXDAI'))
  )
    return 'DAI';
  return symbol;
};

export const tokenImageHandler = ({
  symbol,
  primaryImage,
  backupImage,
  chainId,
}: {
  symbol: string | null | undefined;
  primaryImage: string | undefined;
  backupImage?: string | undefined;
  chainId: number | undefined;
}) => {
  let localImage = primaryImage;
  const networkTokenImage = NETWORK_CURRENCY_IMAGE[chainId || 1];
  if ((!localImage && !backupImage) || (chainId === 100 && !symbol)) {
    localImage = networkTokenImage;
  }
  if (chainId === 100 && toLower(symbol || undefined) === toLower('WXDAI')) {
    localImage = networkTokenImage;
  }
  return localImage;
};

export const filterTokenList = ({
  tokenList,
  approvedTokens,
}: {
  tokenList: any[];
  approvedTokens: string[] | undefined;
}) => {
  if (!tokenList) return [];
  const manuallyRemove = reject(tokenList, (token) =>
    includes(MANUAL_EXCLUDE_TOKENS, get(token, 'tokenAddress')),
  );

  if (!approvedTokens)
    return filter(manuallyRemove, (token) => token.balance > 0);

  return filter(
    manuallyRemove,
    (token: any) =>
      token.balance > 0 &&
      (includes(
        approvedTokens,
        symbolPriceHandler(get(token, 'token.symbol')),
      ) ||
        !token.tokenAddress),
  );
};

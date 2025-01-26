'use client';

import { NETWORK_CURRENCY, OVERRIDE_TOKEN_IMAGE } from '@hatsprotocol/config';
import { useApprovedTokens, useSafeTokens, useTokenDetails, useTokenPrices } from 'hooks';
import { find, get, includes, isEmpty, map, toLower, toUpper } from 'lodash';
import {
  filterTokenList,
  formatBalanceValue,
  formatRoundedDecimals,
  symbolPriceHandler,
  tokenImageHandler,
} from 'utils';
import { Hex } from 'viem';

const SafeAssetRow = ({ token, chainId }: { token: any; chainId: number }) => {
  const { data: prices } = useTokenPrices();

  const localTokenImage = !includes(OVERRIDE_TOKEN_IMAGE, get(token, 'tokenAddress'))
    ? get(token, 'token.logoUri')
    : undefined;
  const localTokenSymbol =
    (get(token, 'token.symbol') ? symbolPriceHandler(get(token, 'token.symbol')) : undefined) ||
    (chainId ? symbolPriceHandler(NETWORK_CURRENCY[chainId]) : undefined);
  const priceDetails = find(prices, {
    symbol: toUpper(localTokenSymbol),
  });
  const { data: tokenData } = useTokenDetails({
    symbol: toLower(localTokenSymbol),
  });

  if (!chainId) return null;

  const tokenImage = tokenImageHandler({
    symbol: get(token, 'token.symbol'),
    primaryImage: get(tokenData, 'avatar'),
    backupImage: localTokenImage,
    chainId,
  });

  return (
    <div className='flex justify-between'>
      {formatBalanceValue({
        price: get(priceDetails, 'priceUsd'),
        balance: token.balance,
        decimals: get(token, 'token.decimals', 18),
      }) ? (
        <h2 className='text-xl'>
          $
          {formatBalanceValue({
            price: get(priceDetails, 'priceUsd'),
            balance: token.balance,
            decimals: get(token, 'token.decimals', 18),
          })}
        </h2>
      ) : (
        <span>&nbsp;</span>
      )}

      <div className='flex gap-2' key={token.address}>
        <h2 className='text-lg font-medium'>
          {formatRoundedDecimals({
            value: token.balance,
            decimals: get(token, 'token.decimals'),
          })}
        </h2>

        <div className='flex gap-1'>
          <img src={tokenImage} className='h-4 w-4' alt='token image' />
          <p className='text-sm'>{get(token, 'token.symbol', get(NETWORK_CURRENCY, chainId || 1))}</p>
        </div>
      </div>
    </div>
  );
};

const SafeAssets = ({ safeAddress, chainId }: { safeAddress: Hex; chainId: number }) => {
  const { data: approvedTokens } = useApprovedTokens();
  const { data: safeTokens } = useSafeTokens({
    safeAddress,
    chainId,
  });

  const filteredSafeTokens = filterTokenList({
    tokenList: safeTokens,
    approvedTokens,
  });

  if (!chainId) return null;

  if (isEmpty(filteredSafeTokens)) {
    return (
      <div className='flex w-full'>
        <div className='flex w-full flex-col gap-2'>
          <h2 className='text-sm font-medium'>Assets</h2>

          <p>None found</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex w-full'>
      <div className='flex w-full flex-col gap-2'>
        <h2 className='text-sm font-medium'>Assets</h2>

        {map(filteredSafeTokens, (token: any) => (
          <SafeAssetRow token={token} chainId={chainId} key={token.tokenAddress || 'native currency'} />
        ))}
      </div>
    </div>
  );
};

export { SafeAssets };

'use client';

import { NETWORK_CURRENCY, OVERRIDE_TOKEN_IMAGE } from '@hatsprotocol/config';
import { safeUrl } from 'hats-utils';
import {
  useApprovedTokens,
  useClipboard,
  useSafeTokens,
  useSafeTransactions,
  useTokenDetails,
  useTokenPrices,
} from 'hooks';
import { CopyAddress, Safe as SafeIcon } from 'icons';
import { find, first, get, includes, isEmpty, map, toLower, toNumber, toUpper } from 'lodash';
import { SafeTransaction, SupportedChains } from 'types';
import { Button, Skeleton } from 'ui';
import {
  filterSafeTransactions,
  filterTokenList,
  formatRoundedDecimals,
  formatTimestamp,
  logger,
  onlyInboundTransactions,
  onlyOutboundTransactions,
  symbolPriceHandler,
  tokenImageHandler,
} from 'utils';
import { formatUnits, Hex } from 'viem';

const PercentageCircle = ({ percentage }: { percentage: number }) => {
  // For 100%, render a full circle
  if (percentage === 100) {
    return (
      <svg width='16' height='16' viewBox='0 0 16 16'>
        <circle cx='8' cy='8' r='8' fill='#000000' />
      </svg>
    );
  }

  const degrees = (percentage / 100) * 360;
  const radians = (degrees * Math.PI) / 180;

  const x = Math.sin(radians) * 8;
  const y = -Math.cos(radians) * 8;

  const largeArcFlag = percentage > 50 ? 1 : 0;

  return (
    <svg width='16' height='16' viewBox='0 0 16 16'>
      {/* background circle (total value) */}
      <circle cx='8' cy='8' r='8' fill='#d9d9d9' opacity='0.2' />
      {/* percentage arc (percent of total value) */}
      <path
        d={`
          M 8 8
          L 8 0
          A 8 8 0 ${largeArcFlag} 1 ${8 + x} ${8 + y}
          L 8 8
        `}
        fill='#000000'
      />
    </svg>
  );
};

// Helper function to format numbers with commas
const formatNumberWithCommas = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

const SafeAssetRow = ({
  token,
  chainId,
  totalSafeValue,
  tokenUsdValue,
  safeAddress,
}: {
  token: any;
  chainId: number;
  totalSafeValue: number;
  tokenUsdValue: number;
  safeAddress: Hex;
  filteredSafeTokens: any[];
}) => {
  const { data: prices } = useTokenPrices();
  const { data: safeTransactions } = useSafeTransactions({
    safeAddress,
    chainId,
  });

  const localTokenImage = !includes(OVERRIDE_TOKEN_IMAGE, get(token, 'tokenAddress'))
    ? get(token, 'token.logoUri')
    : undefined;
  const localTokenSymbol = symbolPriceHandler(get(token, 'token.symbol') || NETWORK_CURRENCY[chainId]);
  const { data: tokenData } = useTokenDetails({
    symbol: toLower(localTokenSymbol),
  });

  // calculate percentage based on total value
  const percentage = totalSafeValue > 0 && tokenUsdValue > 0 ? Math.round((tokenUsdValue / totalSafeValue) * 100) : 0;

  console.log('Percentage Debug:', {
    tokenUsdValue,
    totalSafeValue,
    calculatedPercentage: percentage,
    symbol: localTokenSymbol,
    hasPrice: !!find(prices, {
      symbol: toUpper(symbolPriceHandler(get(token, 'token.symbol') || NETWORK_CURRENCY[chainId])),
    }),
  });

  // last in, Last out transactions
  const filteredSafeTransactions = filterSafeTransactions(safeTransactions, [get(token, 'token.symbol')]);
  const inboundTransactions = onlyInboundTransactions(filteredSafeTransactions, safeAddress);
  const outboundTransactions = onlyOutboundTransactions(filteredSafeTransactions, safeAddress);
  const lastInbound = first(inboundTransactions) as unknown as SafeTransaction;
  const lastOutbound = first(outboundTransactions) as unknown as SafeTransaction;

  const formatTransactionAmount = (tx: SafeTransaction | undefined) => {
    if (!tx) return null;
    const firstTransfer = get(tx, 'transfers.0');
    if (!firstTransfer) return null;

    const value = get(firstTransfer, 'value', '0');
    const decimals = get(firstTransfer, 'tokenInfo.decimals', 18);
    return Number(
      formatRoundedDecimals({
        value: BigInt(value),
        decimals,
      }),
    ).toFixed(2);
  };

  if (!chainId) return null;

  const tokenImage = tokenImageHandler({
    symbol: get(token, 'token.symbol'),
    primaryImage: get(tokenData, 'avatar'),
    backupImage: localTokenImage,
    chainId,
  });

  const formattedBalance = formatNumberWithCommas(
    Number(formatUnits(BigInt(token.balance), get(token, 'token.decimals', 18))),
  );

  return (
    <div className='flex h-16 w-full items-center border-b border-gray-200 px-2 md:px-0'>
      {/* Token */}
      <div className='flex min-w-[200px] items-center gap-4'>
        <div className='flex min-w-[80px] items-center gap-2'>
          <span className='font-mono text-gray-500'>{localTokenSymbol}</span>
          <img src={tokenImage} className='h-8 w-8' alt='token image' />
        </div>
        <div className='flex flex-col'>
          <span className='font-medium'>{get(token, 'token.name', 'Ethereum')}</span>
          <div className='flex items-center gap-1 text-sm text-gray-500'>
            <PercentageCircle percentage={percentage} />
            <span>{percentage}%</span>
          </div>
        </div>
      </div>

      {/* Amount, Last in, Last out */}
      <div className='flex flex-1 items-center justify-end gap-12'>
        <div className='w-40 text-right'>
          <p className='font-mono'>
            <span className='text-gray-500'>{localTokenSymbol}</span> {formattedBalance}
          </p>
          {tokenUsdValue > 0 && <p className='text-sm text-gray-500'>~${formatNumberWithCommas(tokenUsdValue)}</p>}
        </div>
        <div className='w-40 text-right'>
          {lastInbound ? (
            <div className='flex flex-col items-end'>
              <div className='flex items-center gap-1'>
                <span className='font-mono text-gray-500'>{localTokenSymbol}</span>
                <span className='font-mono text-black'>+{formatTransactionAmount(lastInbound)}</span>
                {Number(formatTransactionAmount(lastInbound)) >= 1000 && (
                  <span className='font-mono text-gray-500'>K</span>
                )}
              </div>
              <span className='text-sm text-gray-500'>{formatTimestamp(get(lastInbound, 'executionDate', ''))}</span>
            </div>
          ) : (
            <div className='flex flex-col items-end'>
              <span className='font-mono text-gray-400'>-</span>
              <span className='text-sm text-gray-400'>No transactions</span>
            </div>
          )}
        </div>
        <div className='w-40 text-right'>
          {lastOutbound ? (
            <div className='flex flex-col items-end'>
              <div className='flex items-center gap-1'>
                <span className='font-mono text-gray-500'>{localTokenSymbol}</span>
                <span className='font-mono text-red-600'>-{formatTransactionAmount(lastOutbound)}</span>
                {Number(formatTransactionAmount(lastOutbound)) >= 1000 && (
                  <span className='font-mono text-gray-500'>K</span>
                )}
              </div>
              <span className='text-sm text-gray-500'>{formatTimestamp(get(lastOutbound, 'executionDate', ''))}</span>
            </div>
          ) : (
            <div className='flex flex-col items-end'>
              <span className='font-mono text-gray-400'>-</span>
              <span className='text-sm text-gray-400'>No transactions</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SafeAssets = ({ safeAddress, chainId }: { safeAddress: Hex; chainId: number }) => {
  const { data: approvedTokens, isLoading: approvedTokensLoading } = useApprovedTokens();
  const { data: safeTokens, isLoading: safeTokensLoading } = useSafeTokens({
    safeAddress,
    chainId,
  });
  const { data: prices } = useTokenPrices();
  const priceData = prices || [];

  const { data: safeTransactions } = useSafeTransactions({
    safeAddress,
    chainId,
  });

  const filteredSafeTokens = filterTokenList({
    tokenList: safeTokens,
    approvedTokens,
  });

  // calculate total safe value in USD using raw values - matching safe-total.tsx implementation
  const totalSafeValue =
    isEmpty(filteredSafeTokens) || isEmpty(prices) || !chainId
      ? 0
      : filteredSafeTokens.reduce((usdBal, token) => {
          const symbol = get(token, 'token.symbol')
            ? symbolPriceHandler(get(token, 'token.symbol'))
            : symbolPriceHandler(NETWORK_CURRENCY[chainId]);

          const price = find(prices, {
            symbol: toUpper(symbol),
          });
          if (!price) return usdBal;

          return (
            usdBal +
            toNumber(formatUnits(BigInt(token.balance), get(token, 'token.decimals', 18))) * toNumber(price.priceUsd)
          );
        }, 0);

  // map tokens with their usd values
  const tokenValues = map(filteredSafeTokens, (token) => {
    const symbol = get(token, 'token.symbol')
      ? symbolPriceHandler(get(token, 'token.symbol'))
      : chainId
        ? symbolPriceHandler(NETWORK_CURRENCY[chainId])
        : undefined;

    // Convert symbol to CoinGecko ID format
    const priceId = symbol?.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const price = priceData.find((p: { symbol: string; priceUsd: string }) => p.symbol === priceId?.toUpperCase());

    console.log('Price Debug:', {
      rawSymbol: get(token, 'token.symbol'),
      processedSymbol: symbol,
      priceId,
      pricesAvailable: priceData.length,
      foundPrice: price,
      firstFewPrices: priceData.slice(0, 3),
    });

    const usdValue = price?.priceUsd
      ? toNumber(formatUnits(BigInt(token.balance), get(token, 'token.decimals', 18))) * toNumber(price.priceUsd)
      : 0;

    console.log('Token Debug:', {
      symbol,
      balance: token.balance,
      decimals: get(token, 'token.decimals', 18),
      priceUsd: price?.priceUsd,
      calculatedUsdValue: usdValue,
      totalSafeValue,
    });

    return {
      token,
      usdValue,
    };
  });

  const { onCopy } = useClipboard(safeUrl(chainId as SupportedChains, safeAddress), {
    toastData: { title: 'Address copied' },
  });

  if (!chainId) return null;

  if (approvedTokensLoading || safeTokensLoading) {
    return (
      <div className='flex flex-col gap-4'>
        <Skeleton className='h-12 w-full' />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className='h-16 w-full' key={index} />
        ))}
      </div>
    );
  }

  if (isEmpty(filteredSafeTokens)) {
    return (
      <div className='flex w-full flex-col gap-2 px-4'>
        <div className='relative'>
          {/* Mobile scroll indicator (same mobile UX as Members Page) */}
          <div className='pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent md:hidden' />

          <div className='scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 overflow-x-scroll pb-4'>
            <div className='min-w-fit'>
              <div className='flex h-14 w-full items-center'>
                <div className='flex h-full min-w-[200px] items-center p-2 md:p-0'>
                  <p>Token</p>
                </div>
                <div className='flex flex-1 items-center justify-end gap-12 pr-2'>
                  <div className='w-40'>
                    <p className='text-right font-medium'>Amount</p>
                  </div>
                  <div className='w-40'>
                    <p className='text-right font-medium'>Last in</p>
                  </div>
                  <div className='w-40'>
                    <p className='text-right font-medium'>Last out</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex w-full flex-col gap-2'>
          <h2 className='text-base font-bold'>No assets found on Safe</h2>
          <p className='max-w-[90%] text-sm'>
            The Safe that was created for this council does not seem to hold any assets. You can copy its address below
            to transfer funds. If you recently added funds, it may take some time until they show up here.
          </p>
        </div>
        <div className='w-full flex-col items-center gap-8 pt-5 md:flex md:flex-row'>
          <div className='flex items-center gap-1'>
            <SafeIcon className='size-4' />
            <span className='font-mono text-xs md:text-sm'>{safeAddress}</span>
          </div>
          <Button variant='link' className='text-functional-link-primary mt-2 md:mt-0' onClick={onCopy}>
            <CopyAddress className='size-4' />
            Copy Safe address
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col px-4 md:px-0'>
      <div className='relative'>
        {/* Mobile scroll indicator */}
        <div className='pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent md:hidden' />

        <div className='scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 overflow-x-scroll pb-4'>
          <div className='min-w-fit'>
            <div className='flex h-14 w-full items-center'>
              <div className='flex h-full min-w-[200px] items-center p-2 md:p-0'>
                <p>Token</p>
              </div>
              <div className='flex flex-1 items-center justify-end gap-12 pr-2'>
                <div className='w-40'>
                  <p className='text-right font-medium'>Amount</p>
                </div>
                <div className='w-40'>
                  <p className='text-right font-medium'>Last in</p>
                </div>
                <div className='w-40'>
                  <p className='text-right font-medium'>Last out</p>
                </div>
              </div>
            </div>

            {map(tokenValues, ({ token, usdValue }) => (
              <SafeAssetRow
                token={token}
                chainId={chainId}
                totalSafeValue={totalSafeValue}
                tokenUsdValue={usdValue}
                safeAddress={safeAddress}
                filteredSafeTokens={filteredSafeTokens}
                key={token.tokenAddress || 'native currency'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { SafeAssets };

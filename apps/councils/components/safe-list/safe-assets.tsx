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

type FormattedNumber = {
  value: string;
  suffix: 'k' | 'M' | null;
};

const formatNumberWithK = (value: number, decimals = 2): FormattedNumber => {
  if (value === 0) return { value: '0', suffix: null };

  // For values >= 1,000,000, format with M
  if (value >= 1000000) {
    const inM = value / 1000000;
    return {
      value: inM.toFixed(2),
      suffix: 'M',
    };
  }

  // For values >= 1000, format with k
  if (value >= 1000) {
    const inK = value / 1000;
    return {
      value: new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(inK),
      suffix: 'k',
    };
  }

  // For values < 1000, show specified decimals
  return {
    value: value.toFixed(decimals),
    suffix: null,
  };
};

const formatUsdValue = (value: number) => {
  if (value === 0) return '$0';

  // For values >= 1,000,000, round to nearest million
  if (value >= 1000000) {
    const inM = Math.round(value / 1000000);
    return `~$${inM}M`;
  }

  // For values < 1,000,000, round to nearest thousand
  const inK = Math.round(value / 1000);
  return `~$${inK}k`;
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

  // last in, Last out transactions
  const filteredSafeTransactions = filterSafeTransactions(safeTransactions, [get(token, 'token.symbol')]);

  // Filter out zero-value transactions and then get inbound/outbound
  const nonZeroTransactions = filteredSafeTransactions?.filter((tx) => {
    const value = get(tx, 'transfers.0.value', '0');
    const decimals = get(tx, 'transfers.0.tokenInfo.decimals', 18);
    // Convert to actual value and check if it would round to 0.00
    const actualValue = Number(formatUnits(BigInt(value), decimals));
    return actualValue >= 0.01; // Filter out anything that would show as 0.00
  });

  const inboundTransactions = onlyInboundTransactions(nonZeroTransactions, safeAddress);
  const outboundTransactions = onlyOutboundTransactions(nonZeroTransactions, safeAddress);
  const lastInbound = first(inboundTransactions) as unknown as SafeTransaction;
  const lastOutbound = first(outboundTransactions) as unknown as SafeTransaction;

  const formattedBalance = () => {
    const rawBalance = Number(formatUnits(BigInt(token.balance), get(token, 'token.decimals', 18)));
    const formatted = formatNumberWithK(rawBalance, 2);
    return (
      <>
        {formatted.value}
        {formatted.suffix && <span className='text-gray-500'> {formatted.suffix}</span>}
      </>
    );
  };

  const formatTransactionAmount = (tx: SafeTransaction | undefined) => {
    if (!tx) return null;
    const firstTransfer = get(tx, 'transfers.0');
    if (!firstTransfer) return null;

    const value = get(firstTransfer, 'value', '0');
    const decimals = get(firstTransfer, 'tokenInfo.decimals', 18);

    try {
      const numericValue = Number(formatUnits(BigInt(value), decimals));
      const formatted = formatNumberWithK(numericValue, 2);
      return {
        value: formatted.value,
        suffix: formatted.suffix,
      };
    } catch (error) {
      logger.error('Error formatting amount:', error);
      return { value: '0', suffix: null };
    }
  };

  if (!chainId) return null;

  const tokenImage = tokenImageHandler({
    symbol: get(token, 'token.symbol'),
    primaryImage: get(tokenData, 'avatar'),
    backupImage: localTokenImage,
    chainId,
  });

  return (
    <div className='flex h-16 w-full items-center border-b border-gray-200 px-2 md:px-0'>
      {/* Token */}
      <div className='flex min-w-[300px] items-center gap-6'>
        <div className='flex min-w-[100px] items-center gap-2'>
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
      <div className='flex flex-1 items-center justify-end gap-16'>
        <div className='w-48 text-right'>
          <p className='font-mono'>
            <span className='text-gray-500'>{localTokenSymbol}</span> {formattedBalance()}
          </p>
          {tokenUsdValue > 0 && <p className='text-sm text-gray-500'>{formatUsdValue(tokenUsdValue)}</p>}
        </div>
        <div className='w-48 text-right'>
          {lastInbound ? (
            <div className='flex flex-col items-end'>
              <div className='flex items-center gap-1'>
                <span className='font-mono text-gray-500'>{localTokenSymbol}</span>
                <span className='font-mono text-black'>
                  +{formatTransactionAmount(lastInbound)?.value}
                  {formatTransactionAmount(lastInbound)?.suffix && (
                    <span className='text-gray-500'> {formatTransactionAmount(lastInbound)?.suffix}</span>
                  )}
                </span>
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
        <div className='w-48 text-right'>
          {lastOutbound ? (
            <div className='flex flex-col items-end'>
              <div className='flex items-center gap-1'>
                <span className='font-mono text-gray-500'>{localTokenSymbol}</span>
                <span className='font-mono text-red-600'>
                  -{formatTransactionAmount(lastOutbound)?.value}
                  {formatTransactionAmount(lastOutbound)?.suffix && (
                    <span className='text-gray-500'> {formatTransactionAmount(lastOutbound)?.suffix}</span>
                  )}
                </span>
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
  const { data: prices, isLoading: pricesLoading } = useTokenPrices();
  const { data: safeTransactions, isLoading: transactionsLoading } = useSafeTransactions({
    safeAddress,
    chainId,
  });

  const priceData = prices || [];

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

    const priceId = symbol?.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const price = priceData.find((p: { symbol: string; priceUsd: string }) => p.symbol === priceId?.toUpperCase());

    // Calculate USD value with more precision
    const balance = Number(formatUnits(BigInt(token.balance), get(token, 'token.decimals', 18)));
    const usdValue = price?.priceUsd ? balance * Number(price.priceUsd) : 0;

    return {
      token,
      usdValue,
    };
  });

  const { onCopy } = useClipboard(safeUrl(chainId as SupportedChains, safeAddress), {
    toastData: { title: 'Address copied' },
  });

  if (!chainId) return null;

  const isLoading = approvedTokensLoading || safeTokensLoading || pricesLoading || transactionsLoading;

  const TableHeader = () => (
    <div className='flex h-14 w-full items-center'>
      <div className='flex h-full min-w-[300px] items-center p-2 md:p-0'>
        <p>Token</p>
      </div>
      <div className='flex flex-1 items-center justify-end gap-16 pr-2'>
        <div className='w-48'>
          <p className='text-right font-medium'>Amount</p>
        </div>
        <div className='w-48'>
          <p className='text-right font-medium'>Last in</p>
        </div>
        <div className='w-48'>
          <p className='text-right font-medium'>Last out</p>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className='flex w-full flex-col px-4 md:px-0'>
        <div className='relative'>
          <div className='pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent md:hidden' />
          <div className='scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 overflow-x-scroll pb-4'>
            <div className='min-w-fit'>
              <TableHeader />
              <div className='flex flex-col gap-4'>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton className='h-16 w-full' key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasNoAssets = isEmpty(filteredSafeTokens);

  return (
    <div className='flex w-full flex-col px-4 md:px-0'>
      <div className='relative'>
        {/* Mobile scroll indicator */}
        <div className='pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent md:hidden' />

        <div className='scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 overflow-x-scroll pb-4'>
          <div className='min-w-fit'>
            <TableHeader />

            {!hasNoAssets ? (
              map(tokenValues, ({ token, usdValue }) => (
                <SafeAssetRow
                  token={token}
                  chainId={chainId}
                  totalSafeValue={totalSafeValue}
                  tokenUsdValue={usdValue}
                  safeAddress={safeAddress}
                  filteredSafeTokens={filteredSafeTokens}
                  key={token.tokenAddress || 'native currency'}
                />
              ))
            ) : (
              <div className='flex w-full flex-col gap-2'>
                <h2 className='text-base font-bold'>No assets found on Safe</h2>
                <p className='max-w-[90%] text-sm'>
                  The Safe that was created for this council does not seem to hold any assets. You can copy its address
                  below to transfer funds. If you recently added funds, it may take some time until they show up here.
                </p>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { SafeAssets };

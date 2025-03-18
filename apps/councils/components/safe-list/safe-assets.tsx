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
import { find, first, get, includes, isEmpty, map, reduce, toLower, toUpper } from 'lodash';
import { SafeTransaction, SupportedChains } from 'types';
import { Button, Skeleton } from 'ui';
import {
  filterSafeTransactions,
  filterTokenList,
  formatBalanceValue,
  formatRoundedDecimals,
  logger,
  onlyInboundTransactions,
  onlyOutboundTransactions,
  symbolPriceHandler,
  tokenImageHandler,
} from 'utils';
import { Hex } from 'viem';

const PercentageCircle = ({ percentage }: { percentage: number }) => {
  // Convert percentage to radians for the arc
  const degrees = (percentage / 100) * 360;
  const radians = (degrees * Math.PI) / 180;

  // Calculate end point of arc
  const x = Math.sin(radians) * 8;
  const y = -Math.cos(radians) * 8;

  // Determine if we need to use the large arc flag (for percentages > 50%)
  const largeArcFlag = percentage > 50 ? 1 : 0;

  return (
    <svg width='16' height='16' viewBox='0 0 16 16' className='text-gray-300'>
      {/* Background circle */}
      <circle cx='8' cy='8' r='8' fill='#000000' opacity='0.2' />
      {/* Percentage arc */}
      <path
        d={`
          M 8 8
          L 8 0
          A 8 8 0 ${largeArcFlag} 1 ${8 + x} ${8 + y}
          L 8 8
        `}
        fill='currentColor'
      />
    </svg>
  );
};

const SafeAssetRow = ({
  token,
  chainId,
  totalSafeValue,
  safeAddress,
  filteredSafeTokens,
}: {
  token: any;
  chainId: number;
  totalSafeValue: number;
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
  const localTokenSymbol =
    (get(token, 'token.symbol') ? symbolPriceHandler(get(token, 'token.symbol')) : undefined) ||
    (chainId ? symbolPriceHandler(NETWORK_CURRENCY[chainId]) : undefined);
  const priceDetails = find(prices, {
    symbol: toUpper(localTokenSymbol),
  });
  const { data: tokenData } = useTokenDetails({
    symbol: toLower(localTokenSymbol),
  });

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));

    if (hours < 1) return 'Less than 1 hour ago';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    if (hours < 48) return '1 day ago';
    return `${Math.floor(hours / 24)} days ago`;
  };

  // Calculate raw USD value for percentage calculation
  const tokenDecimals = get(token, 'token.decimals', 18);
  const rawBalance = Number(
    formatRoundedDecimals({
      value: BigInt(token.balance),
      decimals: tokenDecimals,
    }),
  );
  const price = get(priceDetails, 'priceUsd', 0);
  const rawUsdValue = rawBalance * price;

  // Calculate percentage based on total value
  const percentage = totalSafeValue > 0 ? Math.round((rawUsdValue / totalSafeValue) * 100) : 0;

  // Format USD value for display
  const formattedUsdValue = formatBalanceValue({
    price: get(priceDetails, 'priceUsd'),
    balance: token.balance,
    decimals: tokenDecimals,
    dropDecimals: true,
  });

  // Transaction handling
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

  const formattedBalance = formatRoundedDecimals({
    value: token.balance,
    decimals: get(token, 'token.decimals'),
  });

  return (
    <div className='flex h-16 w-full items-center border-b border-gray-200 px-2'>
      {/* Left: Token info */}
      <div className='flex min-w-[150px] items-center gap-3'>
        <div className='flex items-center gap-2'>
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

      {/* Right: Amount and transactions */}
      <div className='flex flex-1 items-center justify-end gap-12'>
        <div className='w-40 text-right'>
          <p className='font-mono'>
            <span className='text-gray-500'>{localTokenSymbol}</span> {Number(formattedBalance).toFixed(2)}
          </p>
          {formattedUsdValue && <p className='text-sm text-gray-500'>~${formattedUsdValue}</p>}
        </div>
        <div className='w-40 text-right'>
          {lastInbound ? (
            <div className='flex flex-col items-end'>
              <div className='flex items-center gap-1'>
                <span className='font-mono text-gray-500'>{localTokenSymbol}</span>
                <span className='font-mono text-black'>+{formatTransactionAmount(lastInbound)}</span>
                <span className='font-mono text-gray-500'>k</span>
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
                <span className='font-mono text-gray-500'>k</span>
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

  logger.info({ safeAddress, chainId });
  const { data: safeTransactions } = useSafeTransactions({
    safeAddress,
    chainId,
  });

  const filteredSafeTokens = filterTokenList({
    tokenList: safeTokens,
    approvedTokens,
  });

  // Calculate total safe value in USD using raw values
  const totalSafeValue = reduce(
    filteredSafeTokens,
    (sum, token) => {
      const symbol = get(token, 'token.symbol') ? symbolPriceHandler(get(token, 'token.symbol')) : undefined;
      const priceDetails = find(prices, {
        symbol: toUpper(symbol),
      });
      const tokenDecimals = get(token, 'token.decimals', 18);
      const rawBalance = Number(
        formatRoundedDecimals({
          value: BigInt(token.balance),
          decimals: tokenDecimals,
        }),
      );
      const rawUsdValue = get(priceDetails, 'priceUsd', 0) * rawBalance;
      return sum + rawUsdValue;
    },
    0,
  );

  logger.info({ safeTokens });
  logger.info({ safeTransactions });

  const { onCopy } = useClipboard(safeUrl(chainId as SupportedChains, safeAddress), {
    toastData: { title: 'Address copied' },
  });

  if (!chainId) return null;

  if (typeof window === 'undefined' || approvedTokensLoading || safeTokensLoading) {
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
          {/* Mobile scroll indicator */}
          <div className='pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent md:hidden' />

          <div className='scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 overflow-x-scroll pb-4'>
            <div className='min-w-fit'>
              <div className='flex h-14 w-full items-center'>
                <div className='flex h-full min-w-[150px] items-center p-2'>
                  <p>Token</p>
                </div>
                <div className='flex flex-1 items-center justify-end gap-12'>
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
    <div className='flex w-full flex-col px-4'>
      <div className='relative'>
        {/* Mobile scroll indicator */}
        <div className='pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent md:hidden' />

        <div className='scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 overflow-x-scroll pb-4'>
          <div className='min-w-fit'>
            <div className='flex h-14 w-full items-center'>
              <div className='flex h-full min-w-[150px] items-center p-2'>
                <p>Token</p>
              </div>
              <div className='flex flex-1 items-center justify-end gap-12'>
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

            {map(filteredSafeTokens, (token: any) => (
              <SafeAssetRow
                token={token}
                chainId={chainId}
                totalSafeValue={totalSafeValue}
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

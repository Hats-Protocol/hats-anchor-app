'use client';

import { NETWORK_CURRENCY, OVERRIDE_TOKEN_IMAGE } from '@hatsprotocol/config';
import { useTreasury } from 'contexts';
import { useApprovedTokens, usePendingSafeTransactions, useSafeTransactions, useTokenDetails } from 'hooks';
import { get, isEmpty, map, toLower } from 'lodash';
import posthog from 'posthog-js';
import React from 'react';
import { SafeTransaction } from 'types';
import { cn, Link, Skeleton } from 'ui';
import {
  explorerUrl,
  filterSafeTransactions,
  formatRoundedDecimals,
  logger,
  onlyInboundTransactions,
  onlyOutboundTransactions,
  shortDateFormatter,
  symbolPriceHandler,
  tokenImageHandler,
} from 'utils';
import { formatUnits, getAddress, Hex } from 'viem';

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

const TransactionRowWrapper = ({
  children,
  timestamp,
  isPending,
}: {
  children: React.ReactNode;
  timestamp: string;
  isPending: boolean;
}) => (
  <div className='flex items-center justify-between rounded-full border border-gray-200 bg-white px-4 py-4'>
    {children}
    <div className='flex flex-col items-center gap-4 md:flex-row'>
      <span className='text-base font-normal text-black'>{formatTimestamp(timestamp)}</span>
      {!isPending ? (
        <span className='border-functional-success text-functional-success rounded-md border px-3 py-1 text-sm'>
          Success
        </span>
      ) : (
        <span className='rounded-md border border-yellow-500 px-3 py-1 text-sm text-yellow-500'>Pending</span>
      )}
    </div>
  </div>
);

const PendingSafeTransactionRow = ({ tx, safeAddress }: { tx: any; safeAddress: Hex }) => {
  logger.info('Pending tx data in row:', tx);

  // Determine initial symbol from transaction data
  let initialSymbol = 'ETH';
  if (tx?.data && tx.data !== '0x' && tx?.dataDecoded?.method === 'transfer') {
    initialSymbol = 'USDC';
  }

  const { data: tokenData } = useTokenDetails({
    symbol: toLower(initialSymbol),
  });

  try {
    let formattedValue;
    const symbol = initialSymbol;

    // For ETH transfers
    if (tx?.value && tx.value !== '0') {
      formattedValue = formatUnits(BigInt(tx.value), 18);
    }
    // For token transfers (USDC)
    else if (tx?.data && tx.data !== '0x' && tx?.dataDecoded?.method === 'transfer') {
      const parameters = tx?.dataDecoded?.parameters;
      if (parameters && parameters.length > 0) {
        formattedValue = formatRoundedDecimals({
          value: BigInt(parameters[1]?.value || '0'),
          decimals: 6,
        });
      }
    }

    if (!formattedValue) {
      logger.info('No value found in pending tx');
      return null;
    }

    const isInbound = onlyInboundTransactions([tx], safeAddress).length > 0;

    const tokenImage = tokenImageHandler({
      symbol,
      primaryImage: get(tokenData, 'avatar'),
      backupImage: undefined,
      chainId: tx.chainId,
    });

    return (
      <TransactionRowWrapper timestamp={tx.modifiedDate || tx.submissionDate} isPending={true}>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1 font-mono'>
            <span className='text-base font-medium text-black'>{isInbound ? 'receiving' : 'sending'}</span>
            <img src={tokenImage} className='h-5 w-5' alt='token image' />

            <span className='text-black'>{formattedValue}</span>
            <span className='text-gray-500'>{symbol}</span>
          </div>
        </div>
      </TransactionRowWrapper>
    );
  } catch (error) {
    logger.error('Error in PendingSafeTransactionRow:', error);
    logger.info('Transaction that caused error:', tx);
    return null;
  }
};

const ExecutedSafeTransactionRow = ({ tx, safeAddress }: { tx: any; safeAddress: Hex }) => {
  logger.info('Executed tx data:', tx);
  const { data: tokenData } = useTokenDetails({
    symbol: toLower(tx?.transfers?.[0]?.tokenInfo?.symbol || 'ETH'),
  });

  const transfer = tx?.transfers?.[0];
  if (!transfer) {
    logger.info('No transfer found in executed tx');
    return null;
  }

  try {
    const formattedValue = formatRoundedDecimals({
      value: BigInt(transfer.value),
      decimals: transfer.tokenInfo?.decimals || 18,
    });

    const symbol = transfer.tokenInfo?.symbol || 'ETH';
    const localTokenSymbol = symbolPriceHandler(symbol);

    const tokenImage = tokenImageHandler({
      symbol,
      primaryImage: get(tokenData, 'avatar'),
      backupImage: transfer.tokenInfo?.logoUri,
      chainId: tx.chainId,
    });

    const isInbound = onlyInboundTransactions([tx], safeAddress).length > 0;

    return (
      <TransactionRowWrapper timestamp={tx.executionDate} isPending={false}>
        <div className='b flex items-center gap-2'>
          <div className='flex items-center gap-1 font-mono'>
            <span className='text-base font-medium text-black'>{isInbound ? 'received' : 'sent'}</span>
            <img src={tokenImage} className='h-5 w-5' alt='token image' />
            <span className='text-black'>{formattedValue}</span>
            <span className='text-gray-500'>{symbol}</span>
          </div>
        </div>
      </TransactionRowWrapper>
    );
  } catch (error) {
    console.error('Error formatting executed transfer value:', error);
    return null;
  }
};

const SafeTransactions = ({ safeAddress, chainId }: { safeAddress: Hex; chainId: number }) => {
  const { data: safeTransactions, isLoading: isLoadingSafe } = useSafeTransactions({
    safeAddress,
    chainId,
  });
  const { data: pendingSafeTransactions, isLoading: isLoadingPending } = usePendingSafeTransactions({
    safeAddress,
    chainId,
  });
  const { data: approvedTokens } = useApprovedTokens();

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  // Debug logging
  logger.info('safeAddress', safeAddress);
  logger.info('pendingSafeTransactions', pendingSafeTransactions);
  logger.info('safeTransactions', safeTransactions);

  if (!isDev) return null;

  if (isLoadingPending || isLoadingSafe) {
    return (
      <div className='flex w-full flex-col gap-4'>
        {/* Pending Transactions Skeleton */}
        <div className='mb-4 flex w-full flex-col gap-2'>
          <Skeleton className='h-6 w-36' />
          <div className='space-y-2'>
            <Skeleton className='h-12 w-full rounded-full' />
            <Skeleton className='h-12 w-full rounded-full' />
            <Skeleton className='h-12 w-full rounded-full' />
          </div>
        </div>

        {/* Recent Transactions Skeleton */}
        <div className='flex w-full flex-col gap-4'>
          <Skeleton className='h-6 w-40' />
          <div className='space-y-2'>
            <Skeleton className='h-12 w-full rounded-full' />
            <Skeleton className='h-12 w-full rounded-full' />
            <Skeleton className='h-12 w-full rounded-full' />
          </div>
        </div>
      </div>
    );
  }

  // Show pending transactions section
  const pendingTxs = Array.isArray(pendingSafeTransactions) ? pendingSafeTransactions : [];
  logger.info('Processed pending transactions:', pendingTxs);
  logger.info('Has pending transactions?', !isEmpty(pendingTxs));
  const hasPendingTransactions = !isEmpty(pendingTxs);

  // Show executed transactions section
  const recentTxs = Array.isArray(safeTransactions) ? safeTransactions : [];
  const hasRecentTransactions = !isEmpty(recentTxs);

  // Debug logging for transaction arrays
  logger.info('Pending transactions array:', pendingTxs);
  logger.info('Recent transactions array:', recentTxs);

  return (
    <div className='w-full space-y-4 px-4 md:px-0'>
      <div className='mb-4 flex w-full flex-col gap-2'>
        <h2 className='pb-2 text-base font-bold'>Pending Transactions</h2>
        {hasPendingTransactions ? (
          <div className='space-y-2'>
            {map(pendingTxs, (tx, index) => {
              logger.info('Rendering pending tx:', tx);
              return (
                <PendingSafeTransactionRow
                  tx={tx}
                  safeAddress={safeAddress}
                  key={tx.safeTxHash || `pending-${index}`}
                />
              );
            })}
          </div>
        ) : (
          <p className='max-w-[90%] text-base'>No queued transactions</p>
        )}
      </div>

      <div className='flex w-full flex-col gap-2'>
        <h2 className='pb-2 text-base font-bold'>Recent Transactions</h2>
        {hasRecentTransactions ? (
          <div className='space-y-2'>
            {map(recentTxs, (tx, index) => {
              logger.info('Rendering recent tx:', tx);
              return (
                <ExecutedSafeTransactionRow
                  tx={tx}
                  safeAddress={safeAddress}
                  key={tx.transactionHash || tx.safeTxHash || `recent-${index}`}
                />
              );
            })}
          </div>
        ) : (
          <p className='max-w-[90%] text-base'>No recent transactions</p>
        )}
      </div>
    </div>
  );
};

export { SafeTransactions };

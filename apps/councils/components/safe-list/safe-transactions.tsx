'use client';

import {
  useApprovedTokens,
  usePendingSafeTransactions,
  useSafeRegisteredEvents,
  useSafeTransactions,
  useTokenDetails,
} from 'hooks';
import { get, includes, isEmpty, map, reject, toLower } from 'lodash';
import posthog from 'posthog-js';
import React from 'react';
import { BsArrowDownLeftCircle, BsArrowUpRightCircle } from 'react-icons/bs';
import { MemberAvatar, Skeleton } from 'ui';
import { formatTimestamp, logger, onlyInboundTransactions, tokenImageHandler } from 'utils';
import { formatUnits, Hex } from 'viem';

const formatNumberWithSuffix = (value: number, showDecimals = true, showKMDecimals = false, isEth = false): string => {
  if (value === 0) return showDecimals ? '0.00' : '0';

  // For millions (1,000,000+)
  if (value >= 1000000) {
    const inM = value / 1000000;
    if (showKMDecimals) {
      return `${inM.toFixed(1)}M`;
    }
    return `${showDecimals ? inM.toFixed(2) : Math.floor(inM)}M`;
  }

  // For thousands (1,000+)
  if (value >= 1000) {
    const inK = value / 1000;
    if (showKMDecimals) {
      return `${inK.toFixed(1)}k`;
    }
    return `${showDecimals ? inK.toFixed(2) : Math.floor(inK)}k`;
  }

  // For small ETH values (< 0.1), show 3 decimal places
  if (isEth && value < 0.1) {
    return value.toFixed(3);
  }

  // For values < 1000
  return showDecimals ? value.toFixed(2) : Math.floor(value).toString();
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
  <div className='flex items-center justify-between rounded-full border border-gray-200 bg-white px-6 py-3'>
    {children}
    <div className='flex items-center gap-4'>
      <span className='text-sm text-gray-500'>{formatTimestamp(timestamp)}</span>
      {!isPending ? (
        <span className='border-functional-success text-functional-success hidden rounded-md border px-3 py-1 text-xs md:block'>
          Success
        </span>
      ) : (
        <span className='hidden rounded-md border border-yellow-500 px-3 py-1 text-xs text-yellow-500 md:block'>
          Pending
        </span>
      )}
    </div>
  </div>
);

// TODO: See if we can streamline these types -- had to add types that were not in the SafeTransaction type to support the difference between pending and executed transactions and improve overall type safety
interface Parameter {
  name: string;
  value: string;
}

interface Transaction {
  executionDate?: string;
  transactionHash?: string;
  safeTxHash?: string;
  dataDecoded?: {
    method?: string;
    parameters: Parameter[];
  };
  transfers?: any[];
  [key: string]: any;
}

interface RegisteredEvent {
  id: string;
  signer: string;
  timestamp: string;
  hatId: string;
  hsg: {
    id: string;
    safe: string;
  };
}

type TransactionActivity = Transaction & { type: 'transaction' };
type RegisteredActivity = RegisteredEvent & { type: 'registered' };
type ActivityItem = TransactionActivity | RegisteredActivity;

const TransactionRow = ({ tx, safeAddress, isPending }: { tx: any; safeAddress: Hex; isPending: boolean }) => {
  // pending ETH/token transfers
  let initialSymbol = 'ETH';
  if (tx?.data && tx.data !== '0x' && tx?.dataDecoded?.method === 'transfer') {
    initialSymbol = 'USDC';
  }

  const { data: tokenData } = useTokenDetails({
    symbol: toLower(isPending ? initialSymbol : tx?.transfers?.[0]?.tokenInfo?.symbol || 'ETH'),
  });

  // handle Safe Created transaction type - only for swapOwner method
  if (!isPending && tx?.dataDecoded?.method === 'swapOwner') {
    const newOwner = tx?.dataDecoded?.parameters?.find((param: Parameter) => param.name === 'newOwner')?.value;
    return (
      <TransactionRowWrapper timestamp={tx.executionDate} isPending={false}>
        <div className='flex items-center gap-1'>
          <div className='flex items-center gap-2'>
            <span className='text-base font-medium text-black'>Safe Account created by</span>
            <MemberAvatar member={{ address: newOwner }} />
          </div>
        </div>
      </TransactionRowWrapper>
    );
  }

  try {
    let numericValue;
    let symbol;
    let decimals;

    if (isPending) {
      symbol = initialSymbol;
      decimals = symbol === 'ETH' ? 18 : 6;

      // for ETH transfers
      if (tx?.value && tx.value !== '0') {
        numericValue = Number(formatUnits(BigInt(tx.value), decimals));
      }
      // for ERC20 token transfers
      else if (tx?.data && tx.data !== '0x' && tx?.dataDecoded?.method === 'transfer') {
        const parameters = tx?.dataDecoded?.parameters;
        if (parameters && parameters.length > 0) {
          numericValue = Number(formatUnits(BigInt(parameters[1]?.value || '0'), decimals));
        }
      }
    } else {
      const transfer = tx?.transfers?.[0];
      if (!transfer) {
        return null;
      }

      numericValue = Number(formatUnits(BigInt(transfer.value), transfer.tokenInfo?.decimals || 18));
      symbol = transfer.tokenInfo?.symbol || 'ETH';
    }

    if (numericValue === undefined) {
      return null;
    }

    const isEth = symbol === 'ETH';
    const formattedValue = formatNumberWithSuffix(numericValue, true, true, isEth);

    const isInbound = onlyInboundTransactions([tx], safeAddress).length > 0;

    const tokenImage = tokenImageHandler({
      symbol,
      primaryImage: get(tokenData, 'avatar'),
      backupImage: !isPending ? tx?.transfers?.[0]?.tokenInfo?.logoUri : undefined,
      chainId: tx.chainId,
    });

    return (
      <TransactionRowWrapper
        timestamp={isPending ? tx.modifiedDate || tx.submissionDate : tx.executionDate}
        isPending={isPending}
      >
        <div className='flex gap-2'>
          <div className='flex items-center gap-2'>
            {isInbound ? (
              <BsArrowDownLeftCircle className='text-functional-success h-4 w-4' />
            ) : (
              <BsArrowUpRightCircle className='text-functional-success h-4 w-4' />
            )}
            <span className='text-base font-medium text-black'>
              {isInbound ? (isPending ? 'receiving' : 'received') : isPending ? 'sending' : 'sent'}
            </span>
            <div className='flex items-center gap-1'>
              <img src={tokenImage} className='h-5 w-5' alt='token image' />
              <span className='font-mono text-black'>{formattedValue}</span>
              <span className='font-mono text-gray-500'>{symbol}</span>
            </div>
          </div>
        </div>
      </TransactionRowWrapper>
    );
  } catch (error) {
    logger.error('Error in TransactionRow:', error);
    return null;
  }
};

const RegisteredEventRow = ({ event }: { event: RegisteredActivity }) => {
  return (
    <TransactionRowWrapper timestamp={event.timestamp} isPending={false}>
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-1'>
          <span className='text-base font-medium text-black'>Council joined by</span>
          <MemberAvatar member={{ address: event.signer }} />
        </div>
      </div>
    </TransactionRowWrapper>
  );
};

const SafeTransactions = ({ hsg, safeAddress, chainId }: { hsg: Hex; safeAddress: Hex; chainId: number }) => {
  const { data: safeTransactions, isLoading: isLoadingSafe } = useSafeTransactions({
    safeAddress,
    chainId,
  });
  const { data: pendingSafeTransactions, isLoading: isLoadingPending } = usePendingSafeTransactions({
    safeAddress,
    chainId,
  });
  const { data: safeRegisteredEvents, isLoading: isLoadingSafeRegisteredEvents } = useSafeRegisteredEvents({
    hsg: toLower(hsg),
    chainId,
  });
  const { data: approvedTokens, isLoading: approvedTokensLoading } = useApprovedTokens();

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  if (!isDev) return null;

  // show loading state if we're loading OR if we don't have data yet
  if (
    isLoadingPending ||
    isLoadingSafe ||
    isLoadingSafeRegisteredEvents ||
    approvedTokensLoading ||
    safeTransactions === undefined ||
    pendingSafeTransactions === undefined ||
    safeRegisteredEvents === undefined ||
    approvedTokens === undefined
  ) {
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

        {/* Recent Activity Skeleton */}
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

  // Filter function that only removes transactions with non-approved tokens
  const filterNonApprovedTokenTransactions = (transactions: any[]) => {
    if (!Array.isArray(transactions)) return [];

    return reject(transactions, (tx) => {
      // If there are no transfers, keep the transaction
      if (!tx?.transfers?.length) return false;

      // If any transfer has a non-approved token, filter out the transaction
      return tx.transfers.some((transfer: any) => {
        const symbol = get(transfer, 'tokenInfo.symbol');
        // Keep the transaction if it's a native token transfer (no symbol) or if the token is approved
        return symbol && !includes(approvedTokens, symbol);
      });
    });
  };

  // show pending transactions section
  const pendingTxs = filterNonApprovedTokenTransactions(pendingSafeTransactions);
  const hasPendingTransactions = !isEmpty(pendingTxs);

  // show executed transactions and registered events section
  const recentTxs = filterNonApprovedTokenTransactions(safeTransactions);
  const registeredEvents = Array.isArray(safeRegisteredEvents) ? safeRegisteredEvents : [];

  const hasRecentActivity = !isEmpty(recentTxs) || !isEmpty(registeredEvents);

  // combine and sort transactions and events by timestamp
  const transactionActivities: TransactionActivity[] = recentTxs.map((tx: Transaction) => ({
    ...tx,
    type: 'transaction' as const,
  }));

  const registeredActivities: RegisteredActivity[] = registeredEvents.map((event: any) => ({
    ...event,
    type: 'registered' as const,
  }));

  const allActivity: ActivityItem[] = [...transactionActivities, ...registeredActivities].sort((a, b) => {
    // always put Safe creation (swapOwner) transaction last (oldest)
    if (a.type === 'transaction' && a.dataDecoded?.method === 'swapOwner') return 1;
    if (b.type === 'transaction' && b.dataDecoded?.method === 'swapOwner') return -1;

    // sort by timestamp for all other activities
    const timestampA =
      a.type === 'transaction' ? new Date(a.executionDate || '').getTime() : Number(a.timestamp) * 1000;
    const timestampB =
      b.type === 'transaction' ? new Date(b.executionDate || '').getTime() : Number(b.timestamp) * 1000;
    return timestampB - timestampA;
  });
  logger.info('allActivity', allActivity);

  return (
    <div className='w-full space-y-4 px-4 md:px-0'>
      <div className='mb-4 flex w-full flex-col gap-2'>
        <h2 className='pb-2 text-base font-bold'>Pending Transactions</h2>
        {hasPendingTransactions ? (
          <div className='space-y-2'>
            {map(pendingTxs, (tx, index) => (
              <TransactionRow
                tx={tx}
                safeAddress={safeAddress}
                isPending={true}
                key={tx.safeTxHash || `pending-${index}`}
              />
            ))}
          </div>
        ) : (
          <p className='max-w-[90%] text-base'>No queued transactions</p>
        )}
      </div>

      <div className='flex w-full flex-col gap-2'>
        <h2 className='pb-2 text-base font-bold'>Recent Activity</h2>
        {hasRecentActivity ? (
          <div className='space-y-2'>
            {map(allActivity, (item: ActivityItem, index) => {
              if (item.type === 'registered') {
                return <RegisteredEventRow event={item} key={item.id || `registered-${index}`} />;
              }
              return (
                <TransactionRow
                  tx={item}
                  safeAddress={safeAddress}
                  isPending={false}
                  key={item.transactionHash || item.safeTxHash || `recent-${index}`}
                />
              );
            })}
          </div>
        ) : (
          <p className='max-w-[90%] text-base'>No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default SafeTransactions;

'use client';

import { useTreasury } from 'contexts';
import { useApprovedTokens, usePendingSafeTransactions, useSafeTransactions } from 'hooks';
import { get, isEmpty, map } from 'lodash';
import { ChevronDown } from 'lucide-react';
import posthog from 'posthog-js';
import React from 'react';
import { SafeTransaction } from 'types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger, Link } from 'ui';
import {
  explorerUrl,
  filterSafeTransactions,
  formatRoundedDecimals,
  logger,
  onlyInboundTransactions,
  onlyOutboundTransactions,
  shortDateFormatter,
} from 'utils';
import { getAddress, Hex } from 'viem';

const TransactionRecord = ({ tx, chainId }: { tx: SafeTransaction; chainId: number | undefined }) => {
  const value = get(tx, 'transfers.0.value');
  if (!value) return null;
  const txHash = get(tx, 'transactionHash', get(tx, 'txHash'));

  return (
    <div className='flex justify-between'>
      <div className='flex gap-1'>
        <p>
          {formatRoundedDecimals({
            value: BigInt(value),
            decimals: get(tx, 'transfers.0.tokenInfo.decimals', 18),
          })}
        </p>
        <p>{get(tx, 'transfers.0.tokenInfo.symbol')}</p>
      </div>

      <div>
        <Link href={`${explorerUrl(chainId)}/tx/${txHash}`}>{shortDateFormatter(new Date(tx.executionDate))}</Link>
      </div>
    </div>
  );
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

  const filteredSafeTransactions = filterSafeTransactions(safeTransactions, approvedTokens);

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  logger.info('safeAddress', safeAddress);
  logger.info('pendingSafeTransactions', pendingSafeTransactions);
  logger.info('safeTransactions', safeTransactions);

  if (!isDev) return null;

  if (isLoadingPending || isLoadingSafe) {
    return <div>Loading transactions...</div>;
  }

  // Show pending transactions section
  const hasPendingTransactions = !isEmpty(pendingSafeTransactions);
  const pendingSection = (
    <div className='mb-4 flex w-full flex-col gap-2'>
      <h2 className='text-base font-bold'>Pending Transactions</h2>
      {hasPendingTransactions ? (
        <div className='space-y-1'>
          {map(pendingSafeTransactions, (tx) => {
            // Handle ETH transfer
            if (tx.value !== '0') {
              return (
                <div key={tx.safeTxHash} className='flex justify-between'>
                  <div className='flex gap-1'>
                    <p>
                      {formatRoundedDecimals({
                        value: BigInt(tx.value),
                        decimals: 18,
                      })}
                    </p>
                    <p>ETH</p>
                  </div>
                  <div>Pending</div>
                </div>
              );
            }
            // Handle ERC20 transfer
            if (tx.dataDecoded?.method === 'transfer') {
              return (
                <div key={tx.safeTxHash} className='flex justify-between'>
                  <div className='flex gap-1'>
                    <p>
                      {formatRoundedDecimals({
                        value: BigInt(tx.dataDecoded.parameters[1].value),
                        decimals: 6, // You might want to make this dynamic based on the token
                      })}
                    </p>
                    <p>USDC</p>
                  </div>
                  <div>Pending</div>
                </div>
              );
            }
            return null;
          })}
        </div>
      ) : (
        <p className='max-w-[90%] text-base'>No queued transactions</p>
      )}
    </div>
  );

  // Show executed transactions section
  if (isEmpty(filteredSafeTransactions)) {
    return (
      <>
        {pendingSection}
        <div className='flex w-full flex-col gap-2'>
          <h2 className='text-base font-bold'>Recent Transactions</h2>
          <p className='max-w-[90%] text-base'>No recent transactions</p>
        </div>
      </>
    );
  }

  return (
    <div className='w-full space-y-4'>
      {pendingSection}

      <Collapsible>
        <CollapsibleTrigger className='flex justify-between'>
          <p>Inbound Transactions</p>
          <ChevronDown />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className='space-y-1'>
            {map(onlyInboundTransactions(filteredSafeTransactions, safeAddress), (tx: SafeTransaction) => (
              <TransactionRecord tx={tx} chainId={chainId} key={tx.transactionHash} />
            )) || <p>No inbound transactions</p>}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className='flex justify-between'>
          <p>Outbound Transactions</p>
          <ChevronDown />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className='space-y-1'>
            {map(onlyOutboundTransactions(filteredSafeTransactions, safeAddress), (tx: SafeTransaction) => (
              <TransactionRecord tx={tx} chainId={chainId} key={tx.transactionHash} />
            )) || <p>No outbound transactions</p>}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export { SafeTransactions };

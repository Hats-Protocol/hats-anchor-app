'use client';

import { useTreasury } from 'contexts';
import { useApprovedTokens, useSafeTransactions } from 'hooks';
import { get, map } from 'lodash';
import { ChevronDown } from 'lucide-react';
import posthog from 'posthog-js';
import React from 'react';
import { SafeTransaction } from 'types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger, Link } from 'ui';
import {
  explorerUrl,
  filterSafeTransactions,
  formatRoundedDecimals,
  onlyInboundTransactions,
  onlyOutboundTransactions,
  shortDateFormatter,
} from 'utils';
import { Hex } from 'viem';

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

const SafeTransactions = ({ safeAddress }: { safeAddress: Hex }) => {
  const { chainId } = useTreasury();
  const { data: safeTransactions } = useSafeTransactions({
    safeAddress,
    chainId,
  });
  const { data: approvedTokens } = useApprovedTokens();
  // const { data: prices } = useTokenPrices();

  const filteredSafeTransactions = filterSafeTransactions(safeTransactions, approvedTokens);

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';

  if (!isDev) return null;

  return (
    <div className='w-full space-y-4'>
      <Collapsible>
        <CollapsibleTrigger className='flex justify-between'>
          <p>Inbound Transactions</p>
          <ChevronDown />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className='space-y-1'>
            {map(onlyInboundTransactions(filteredSafeTransactions, safeAddress), (tx) => (
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
            {map(onlyOutboundTransactions(filteredSafeTransactions, safeAddress), (tx) => (
              <TransactionRecord tx={tx} chainId={chainId} key={tx.transactionHash} />
            )) || <p>No outbound transactions</p>}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export { SafeTransactions };

'use client';

import { useOverlay } from 'contexts';
import { formatDistanceToNow } from 'date-fns';
import { useMediaStyles } from 'hooks';
import { isEmpty, map, take } from 'lodash';
import dynamic from 'next/dynamic';
import { FaRegCheckCircle } from 'react-icons/fa';
import { Transaction } from 'types';
import { Button, Link, Spinner } from 'ui';
import { explorerUrl } from 'utils';

const Etherscan = dynamic(() => import('icons').then((mod) => mod.Etherscan));

// Utility function to get abbreviated hash
const abbreviateHash = (hash: string) => {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, 3)}...${hash.slice(-3)}`;
};

interface TransactionHistoryProps extends Transaction {
  hideHash: boolean;
}

const TransactionHistoryRow = ({
  hash,
  hideHash,
  txChainId,
  status,
  timestamp,
  txDescription,
}: TransactionHistoryProps) => {
  const { isMobile } = useMediaStyles();

  return (
    <Link href={txChainId && hash ? `${explorerUrl(txChainId)}/tx/${hash}` : '#'} className='block' isExternal>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-2'>
          {status === 'pending' ? (
            <Spinner className='text-blue-500' />
          ) : (
            <FaRegCheckCircle className='w-3 text-green-500' />
          )}
          <p className='break-word'>{txDescription}</p>
        </div>

        <div className='flex justify-between pl-5'>
          <div className='flex items-center gap-2'>
            {!hideHash && !isMobile && <p className='text-sm text-gray-500'>{`(${abbreviateHash(hash)})`}</p>}
            <p className='text-xs md:text-sm'>{formatDistanceToNow(new Date(timestamp))} ago</p>
            <Etherscan className='w-3 text-blue-500' />
          </div>
        </div>
      </div>
    </Link>
  );
};

const TransactionHistory = ({
  count,
  transactions,
  hideHash = false,
  showClear = false,
}: {
  count?: number;
  transactions?: Transaction[];
  hideHash?: boolean;
  showClear?: boolean;
}) => {
  const { clearAllTransactions, transactions: allTransactions } = useOverlay();
  let events = transactions || allTransactions;

  if (count) {
    events = take(transactions, count);
  }

  if (events.length === 0) {
    return (
      <div className='flex items-center justify-center py-2'>
        <p className='text-sm text-gray-500'>No recent transactions</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-1'>
      {showClear && (
        <div className='flex justify-end'>
          <Button size='xs' variant='outline-blue' onClick={clearAllTransactions} disabled={isEmpty(events)}>
            Clear
          </Button>
        </div>
      )}

      {map(events, ({ hash, txChainId, status, timestamp, txDescription }: Transaction) => (
        <TransactionHistoryRow
          hash={hash}
          hideHash={hideHash}
          txChainId={txChainId}
          status={status}
          timestamp={timestamp}
          txDescription={txDescription}
          key={hash}
        />
      ))}
    </div>
  );
};

export { TransactionHistory };

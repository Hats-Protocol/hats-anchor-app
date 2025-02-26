'use client';

import { NETWORK_CURRENCY } from '@hatsprotocol/config';
import { useTreasury } from 'contexts';
import { useApprovedTokens, useSafeTransactions, useTokenDetails, useTokenPrices } from 'hooks';
import { find, first, get, toLower, toUpper } from 'lodash';
import { BsFillArrowDownRightCircleFill, BsFillArrowUpRightCircleFill } from 'react-icons/bs';
import { Link } from 'ui';
import {
  explorerUrl,
  filterSafeTransactions,
  findLastInboundTransaction,
  findLastOutboundTransaction,
  formatBalanceValue,
  formatRoundedDecimals,
  shortDateFormatter,
  symbolPriceHandler,
  tokenImageHandler,
} from 'utils';
import { Hex } from 'viem';

const TRANSACTION_TYPE = {
  inbound: 'inbound',
  outbound: 'outbound',
};

const LastTransaction = ({ safeAddress, type }: { safeAddress: Hex; type: string }) => {
  const { chainId } = useTreasury();

  const { data: safeTransactions } = useSafeTransactions({
    safeAddress,
    chainId,
  });
  const { data: approvedTokens } = useApprovedTokens();
  const { data: prices } = useTokenPrices();

  const filteredSafeTransactions = filterSafeTransactions(safeTransactions, approvedTokens);
  const lastInbound = findLastInboundTransaction(filteredSafeTransactions, safeAddress);
  const lastOutbound = findLastOutboundTransaction(filteredSafeTransactions, safeAddress);
  const transaction = type === TRANSACTION_TYPE.inbound ? lastInbound : lastOutbound;
  const firstTransfer = first(get(transaction, 'transfers'));
  const firstTransferSymbol = get(firstTransfer, 'tokenInfo.symbol');

  const priceDetails = find(prices, {
    symbol: toUpper(
      (firstTransferSymbol ? symbolPriceHandler(firstTransferSymbol) : undefined) ||
        (chainId && symbolPriceHandler(NETWORK_CURRENCY[chainId])),
    ),
  });
  const { data: tokenData } = useTokenDetails({
    symbol: toLower(
      (firstTransferSymbol ? symbolPriceHandler(firstTransferSymbol) : undefined) ||
        (chainId && symbolPriceHandler(NETWORK_CURRENCY[chainId])),
    ),
  });

  if (!transaction) return null;

  const tokenImage = tokenImageHandler({
    symbol: firstTransferSymbol,
    primaryImage: get(tokenData, 'avatar'),
    backupImage: get(firstTransfer, 'tokenInfo.logoUri'),
    chainId,
  });

  return (
    <div className='flex items-center gap-4'>
      <div className='flex flex-col items-center gap-1'>
        <p className='text-xs font-medium'>{type === TRANSACTION_TYPE.inbound ? 'Last In' : 'Last Out'}</p>

        {type === TRANSACTION_TYPE.inbound ? (
          <BsFillArrowDownRightCircleFill className='h-6 w-6 text-green-200' />
        ) : (
          <BsFillArrowUpRightCircleFill className='h-6 w-6 text-red-200' />
        )}

        <p className='text-xs'>{shortDateFormatter(new Date(get(transaction, 'executionDate') || ''))}</p>
      </div>

      <Link href={`${explorerUrl(chainId)}/tx/${get(transaction, 'transactionHash', get(transaction, 'txHash'))}`}>
        <div className='flex flex-col items-center gap-0'>
          <p className='text-lg font-medium'>
            $
            {formatBalanceValue({
              price: get(priceDetails, 'priceUsd'),
              balance: BigInt(get(firstTransfer, 'value', '0')),
              decimals: get(firstTransfer, 'tokenInfo.decimals', 18),
              dropDecimals: true,
            })}
          </p>

          <p className='text-sm'>
            {formatRoundedDecimals({
              value: BigInt(get(firstTransfer, 'value', '0')),
              decimals: get(firstTransfer, 'tokenInfo.decimals', 18),
            })}
          </p>

          <div className='flex items-center gap-1'>
            <img src={tokenImage} alt={`${get(firstTransfer, 'tokenInfo.symbol')} logo`} className='h-4 w-4' />
            <p className='text-sm'>{get(firstTransfer, 'tokenInfo.symbol') || NETWORK_CURRENCY[chainId || 1]}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export { LastTransaction };

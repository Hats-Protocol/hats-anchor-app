'use client';

import { Heading, HStack, Icon, Image, Link, Stack, Text } from '@chakra-ui/react';
import { NETWORK_CURRENCY } from '@hatsprotocol/constants';
import { useTreasury } from 'contexts';
import { useApprovedTokens, useSafeTransactions, useTokenDetails, useTokenPrices } from 'hooks';
import { find, first, get, toLower, toUpper } from 'lodash';
import { BsFillArrowDownRightCircleFill, BsFillArrowUpRightCircleFill } from 'react-icons/bs';
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
    <HStack spacing={4}>
      <Stack align='center' spacing={1}>
        <Heading variant='medium' size='xs'>
          {type === TRANSACTION_TYPE.inbound ? 'Last In' : 'Last Out'}
        </Heading>

        {type === TRANSACTION_TYPE.inbound ? (
          <Icon as={BsFillArrowDownRightCircleFill} boxSize={6} color='green.200' />
        ) : (
          <Icon as={BsFillArrowUpRightCircleFill} boxSize={6} color='red.200' />
        )}

        <Text size='xs'>{shortDateFormatter(new Date(get(transaction, 'executionDate')))}</Text>
      </Stack>

      <Link href={`${explorerUrl(chainId)}/tx/${get(transaction, 'transactionHash', get(transaction, 'txHash'))}`}>
        <Stack align='center' spacing={0}>
          <Heading size='lg' variant='medium'>
            $
            {formatBalanceValue({
              price: get(priceDetails, 'priceUsd'),
              balance: BigInt(get(firstTransfer, 'value', '0')),
              decimals: get(firstTransfer, 'tokenInfo.decimals', 18),
              dropDecimals: true,
            })}
          </Heading>

          <Text size='sm'>
            {formatRoundedDecimals({
              value: BigInt(get(firstTransfer, 'value', '0')),
              decimals: get(firstTransfer, 'tokenInfo.decimals', 18),
            })}
          </Text>

          <HStack spacing={1}>
            <Image boxSize={4} src={tokenImage} alt={`${get(firstTransfer, 'tokenInfo.symbol')} logo`} />
            <Text size='sm'>{get(firstTransfer, 'tokenInfo.symbol') || NETWORK_CURRENCY[chainId || 1]}</Text>
          </HStack>
        </Stack>
      </Link>
    </HStack>
  );
};

export default LastTransaction;

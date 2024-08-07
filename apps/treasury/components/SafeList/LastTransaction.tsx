'use client';

import {
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import {
  NETWORK_CURRENCY,
  NETWORK_CURRENCY_IMAGE,
} from '@hatsprotocol/constants';
import { useTreasury } from 'contexts';
import { useSafeTransactions, useTokenDetails, useTokenPrices } from 'hooks';
import {
  every,
  filter,
  find,
  first,
  get,
  some,
  toLower,
  toUpper,
} from 'lodash';
import {
  BsFillArrowDownRightCircleFill,
  BsFillArrowUpRightCircleFill,
} from 'react-icons/bs';
import {
  explorerUrl,
  formatBalanceValue,
  formatRoundedDecimals,
  shortDateFormatter,
  symbolPriceHandler,
  tokenImageHandler,
} from 'utils';
import { getAddress, Hex } from 'viem';

const TRANSACTION_TYPE = {
  inbound: 'inbound',
  outbound: 'outbound',
};

const inboundTransactions = (transactions: any, safeAddress: Hex) => {
  return filter(
    transactions,
    (tx) =>
      some(
        tx.transfers,
        (transfer) => transfer.to === getAddress(safeAddress),
      ) &&
      every(tx.transfers, (transfer) => transfer.type !== 'ERC721_TRANSFER'),
  );
};

const outboundTransactions = (transactions: any, safeAddress: Hex) => {
  return filter(transactions, (tx) =>
    some(tx.transfers, (transfer) => transfer.from === getAddress(safeAddress)),
  );
};

const findLastInboundTransaction = (transactions: any, safeAddress: Hex) => {
  const inboundTx = inboundTransactions(transactions, safeAddress);
  return first(inboundTx);
};

const findLastOutboundTransaction = (transactions: any, safeAddress: Hex) => {
  const outboundTx = outboundTransactions(transactions, safeAddress);
  return first(outboundTx);
};

const LastTransaction = ({
  safeAddress,
  type,
}: {
  safeAddress: Hex;
  type: string;
}) => {
  const { chainId } = useTreasury();

  const { data: safeTransactions } = useSafeTransactions({
    safeAddress,
    chainId,
  });
  const { data: prices } = useTokenPrices();

  const lastInbound = findLastInboundTransaction(safeTransactions, safeAddress);
  const lastOutbound = findLastOutboundTransaction(
    safeTransactions,
    safeAddress,
  );
  const transaction =
    type === TRANSACTION_TYPE.inbound ? lastInbound : lastOutbound;
  const firstTransfer = first(get(transaction, 'transfers'));
  const firstTransferSymbol = get(firstTransfer, 'tokenInfo.symbol');

  const priceDetails = find(prices, {
    symbol: toUpper(
      (firstTransferSymbol
        ? symbolPriceHandler(firstTransferSymbol)
        : undefined) ||
        (chainId && symbolPriceHandler(NETWORK_CURRENCY[chainId])),
    ),
  });
  const { data: tokenData } = useTokenDetails({
    symbol: toLower(
      (firstTransferSymbol
        ? symbolPriceHandler(firstTransferSymbol)
        : undefined) ||
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
          <Icon
            as={BsFillArrowDownRightCircleFill}
            boxSize={6}
            color='green.200'
          />
        ) : (
          <Icon as={BsFillArrowUpRightCircleFill} boxSize={6} color='red.200' />
        )}

        <Text size='xs'>
          {shortDateFormatter(new Date(get(transaction, 'executionDate')))}
        </Text>
      </Stack>

      <Link
        href={`${explorerUrl(chainId)}/tx/${get(
          transaction,
          'transactionHash',
        )}`}
      >
        <Stack align='center' spacing={0}>
          <Heading size='lg' variant='medium'>
            $
            {formatBalanceValue({
              price: get(priceDetails, 'priceUsd'),
              balance: BigInt(get(firstTransfer, 'value', '0')),
              decimals: get(firstTransfer, 'tokenInfo.decimals', 18),
              startScientific: 3,
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
            <Image
              boxSize={4}
              src={tokenImage}
              alt={`${get(firstTransfer, 'tokenInfo.symbol')} logo`}
            />
            <Text size='sm'>
              {get(firstTransfer, 'tokenInfo.symbol') ||
                NETWORK_CURRENCY[chainId || 1]}
            </Text>
          </HStack>
        </Stack>
      </Link>
    </HStack>
  );
};

export default LastTransaction;

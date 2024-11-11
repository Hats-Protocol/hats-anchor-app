import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTreasury } from 'contexts';
import { useApprovedTokens, useSafeTransactions } from 'hooks';
import { get, map } from 'lodash';
import posthog from 'posthog-js';
import React from 'react';
import { SafeTransaction } from 'types';
import { ChakraNextLink } from 'ui';
import {
  explorerUrl,
  filterSafeTransactions,
  formatRoundedDecimals,
  onlyInboundTransactions,
  onlyOutboundTransactions,
  shortDateFormatter,
} from 'utils';
import { Hex } from 'viem';

const TransactionRecord = ({
  tx,
  chainId,
}: {
  tx: SafeTransaction;
  chainId: number | undefined;
}) => {
  const value = get(tx, 'transfers.0.value');
  if (!value) return null;
  const txHash = get(tx, 'transactionHash', get(tx, 'txHash'));

  return (
    <Flex justify='space-between'>
      <Flex gap={1}>
        <Text>
          {formatRoundedDecimals({
            value: BigInt(value),
            decimals: get(tx, 'transfers.0.tokenInfo.decimals', 18),
          })}
        </Text>
        <Text>{get(tx, 'transfers.0.tokenInfo.symbol')}</Text>
      </Flex>

      <Box>
        <ChakraNextLink href={`${explorerUrl(chainId)}/tx/${txHash}`}>
          {shortDateFormatter(new Date(tx.executionDate))}
        </ChakraNextLink>
      </Box>
    </Flex>
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

  const filteredSafeTransactions = filterSafeTransactions(
    safeTransactions,
    approvedTokens,
  );

  const isDev =
    posthog.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';

  if (!isDev) return null;

  return (
    <Accordion w='full' allowMultiple pt={4}>
      <AccordionItem>
        <AccordionButton display='flex' justifyContent='space-between'>
          <Text>Inbound Transactions</Text>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <Stack spacing={1}>
            {map(
              onlyInboundTransactions(filteredSafeTransactions, safeAddress),
              (tx) => (
                <TransactionRecord
                  tx={tx}
                  chainId={chainId}
                  key={tx.transactionHash}
                />
              ),
            ) || <Text>No inbound transactions</Text>}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton display='flex' justifyContent='space-between'>
          <Text>Outbound Transactions</Text>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <Stack spacing={1}>
            {map(
              onlyOutboundTransactions(filteredSafeTransactions, safeAddress),
              (tx) => (
                <TransactionRecord
                  tx={tx}
                  chainId={chainId}
                  key={tx.transactionHash}
                />
              ),
            ) || <Text>No outbound transactions</Text>}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default SafeTransactions;

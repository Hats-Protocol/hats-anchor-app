'use client';

import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import { formatDistanceToNow } from 'date-fns';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import { FaExternalLinkAlt, FaRegCheckCircle } from 'react-icons/fa';
import { Transaction } from 'types';
import { ChakraNextLink } from 'ui';
import { explorerUrl } from 'utils';

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
    <ChakraNextLink
      isExternal
      href={txChainId && hash ? `${explorerUrl(txChainId)}/tx/${hash}` : '#'}
      display='block'
    >
      <HStack
        key={hash}
        align='center'
        justify='space-between'
        py={2}
        spacing={4}
      >
        <HStack maxW={{ base: '55%', md: '50%' }}>
          {status === 'pending' ? (
            <Spinner color='blue.500' size='xs' />
          ) : (
            <Icon color='green.500' as={FaRegCheckCircle} w='12px' />
          )}
          <Text wordBreak='break-word'>{txDescription}</Text>
        </HStack>

        <HStack>
          {!hideHash && !isMobile && (
            <Text size='sm' variant='gray'>{`(${abbreviateHash(hash)})`}</Text>
          )}
          <Text size={{ base: 'xs', md: 'sm' }}>
            {formatDistanceToNow(new Date(timestamp))} ago
          </Text>
          <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
        </HStack>
      </HStack>
    </ChakraNextLink>
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
    events = _.take(transactions, count);
  }

  if (events.length === 0) {
    return (
      <Flex align='center' justify='center' py={2}>
        <Text
          fontSize='sm'
          color='gray.500'
          textAlign='center'
          fontWeight='medium'
        >
          No recent transactions
        </Text>
      </Flex>
    );
  }

  return (
    <Box>
      <Stack spacing={1}>
        {showClear && (
          <Flex justify='flex-end'>
            <Button
              size='xs'
              variant='outlineMatch'
              colorScheme='blue.500'
              onClick={clearAllTransactions}
              isDisabled={_.isEmpty(transactions)}
            >
              Clear
            </Button>
          </Flex>
        )}

        {_.map(
          events,
          ({
            hash,
            txChainId,
            status,
            timestamp,
            txDescription,
          }: Transaction) => (
            <TransactionHistoryRow
              hash={hash}
              hideHash={hideHash}
              txChainId={txChainId}
              status={status}
              timestamp={timestamp}
              txDescription={txDescription}
              key={hash}
            />
          ),
        )}
      </Stack>
    </Box>
  );
};

export default TransactionHistory;

'use client';

import { Box, Button, Flex, HStack, Icon, Spinner, Stack, Text } from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import { formatDistanceToNow } from 'date-fns';
import { useMediaStyles } from 'hooks';
import { isEmpty, map, take } from 'lodash';
import dynamic from 'next/dynamic';
import { FaRegCheckCircle } from 'react-icons/fa';
import { Transaction } from 'types';
import { Link } from 'ui';
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
      <Stack key={hash} py={2} spacing={1}>
        <HStack>
          {status === 'pending' ? (
            <Spinner color='blue.500' size='xs' />
          ) : (
            <Icon color='green.500' as={FaRegCheckCircle} w={3} />
          )}
          <Text wordBreak='break-word'>{txDescription}</Text>
        </HStack>

        <Flex justify='space-between' pl={5}>
          <HStack>
            {!hideHash && !isMobile && <Text size='sm' variant='gray'>{`(${abbreviateHash(hash)})`}</Text>}
            <Text size={{ base: 'xs', md: 'sm' }}>{formatDistanceToNow(new Date(timestamp))} ago</Text>
            <Icon as={Etherscan} w={3} color='blue.500' />
          </HStack>
        </Flex>
      </Stack>
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
      <Flex align='center' justify='center' py={2}>
        <Text fontSize='sm' color='gray.500' textAlign='center' fontWeight='medium'>
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
              isDisabled={isEmpty(events)}
            >
              Clear
            </Button>
          </Flex>
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
      </Stack>
    </Box>
  );
};

export { TransactionHistory };

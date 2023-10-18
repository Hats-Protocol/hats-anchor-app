import { Box, Flex, HStack, Icon, Spinner, Text } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import { FaExternalLinkAlt, FaRegCheckCircle } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { explorerUrl } from '@/lib/web3';
import { Transaction } from '@/types';

const TransactionHistory = ({ count }: { count?: number }) => {
  const { chainId } = useTreeForm();
  const { transactions } = useOverlay(); // Using the useOverlay hook to get transactions

  let events = [] as Transaction[];

  if (count) {
    events = _.take(transactions, count);
  }

  if (events.length === 0) {
    return (
      <Flex align='center' justify='center' py={2}>
        <Text>No new transactions</Text>
      </Flex>
    );
  }

  // Utility function to get abbreviated hash
  const abbreviateHash = (hash: string) => {
    if (!hash || hash.length < 12) return hash;
    return `${hash.slice(0, 3)}...${hash.slice(-3)}`;
  };

  return (
    <Box>
      {_.map(events, ({ hash, status, timestamp }: Transaction) => (
        <Flex key={hash} align='center' justify='space-between' py={2}>
          {status === 'pending' ? (
            <Spinner color='blue.500' size='xs' />
          ) : (
            <Icon color='green.500' as={FaRegCheckCircle} w='12px' />
          )}

          <ChakraNextLink
            isExternal
            href={`${chainId && explorerUrl(chainId)}/tx/${hash}`}
            display='block'
          >
            <HStack spacing={3}>
              <Text>{abbreviateHash(hash)}</Text>
              <Text>{formatDistanceToNow(new Date(timestamp))} ago</Text>
              <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
            </HStack>
          </ChakraNextLink>
        </Flex>
      ))}
    </Box>
  );
};

export default TransactionHistory;

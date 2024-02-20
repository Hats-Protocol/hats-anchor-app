import { Box, Flex, HStack, Icon, Spinner, Text } from '@chakra-ui/react';
import { explorerUrl } from 'utils';
import { formatDistanceToNow } from 'date-fns';
import { Transaction } from 'hats-types';
import _ from 'lodash';
import { FaExternalLinkAlt, FaRegCheckCircle } from 'react-icons/fa';

import { ChakraNextLink } from '../atoms';

const TransactionHistory = ({
  count,
  transactions,
}: {
  count?: number;
  transactions: Transaction[];
}) => {
  let events = transactions;

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

  // Utility function to get abbreviated hash
  const abbreviateHash = (hash: string) => {
    if (!hash || hash.length < 12) return hash;
    return `${hash.slice(0, 3)}...${hash.slice(-3)}`;
  };

  return (
    <Box>
      {_.map(
        events,
        ({
          hash,
          txChainId,
          status,
          timestamp,
          txDescription,
        }: Transaction) => (
          <ChakraNextLink
            isExternal
            href={
              txChainId && hash ? `${explorerUrl(txChainId)}/tx/${hash}` : '#'
            }
            display='block'
            key={hash}
          >
            <HStack
              key={hash}
              align='center'
              justify='space-between'
              py={2}
              spacing={4}
            >
              <HStack>
                {status === 'pending' ? (
                  <Spinner color='blue.500' size='xs' />
                ) : (
                  <Icon color='green.500' as={FaRegCheckCircle} w='12px' />
                )}
                <Text>{txDescription}</Text>
              </HStack>

              <HStack>
                <Text>{`(${abbreviateHash(hash)})`}</Text>
                <Text>{formatDistanceToNow(new Date(timestamp))} ago</Text>
                <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
              </HStack>
            </HStack>
          </ChakraNextLink>
        ),
      )}
    </Box>
  );
};

export default TransactionHistory;

import React from 'react';
import { Flex, HStack, Icon, Link, Text } from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { explorerUrl } from '../lib/general';

const EventRow = ({ id, timestamp, transactionId, chainId, last }) => (
  <Link isExternal href={`${explorerUrl(chainId)}/tx/${transactionId}`}>
    <Flex
      justify='space-between'
      align='center'
      borderBottom={!last ? '1px solid' : 'none'}
      p={1}
    >
      <HStack spacing={2}>
        <Text>{`${formatDistanceToNow(
          new Date(Number(timestamp) * 1000),
        )} ago`}</Text>
        <Text>-</Text>
        <Text>{id.split('-')[0]}</Text>
      </HStack>

      <Icon as={FaExternalLinkAlt} />
    </Flex>
  </Link>
);

export default EventRow;

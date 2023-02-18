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
      borderColor='gray.200'
      p={1}
    >
      <HStack spacing={10}>
        <Text w='50%'>{`${formatDistanceToNow(
          new Date(Number(timestamp) * 1000),
        )} ago`}</Text>
        <HStack spacing={3}>
          <Text>{id.split('-')[0]}</Text>
          <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
        </HStack>
      </HStack>
    </Flex>
  </Link>
);

export default EventRow;

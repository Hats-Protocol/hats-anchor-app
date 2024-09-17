'use client';

import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { HatsEvent } from '@hatsprotocol/sdk-v1-subgraph';
import { useSelectedHat, useTreeForm } from 'contexts';
import { formatDistanceToNow } from 'date-fns';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';
import { ChakraNextLink } from 'ui';
import { explorerUrl, parseEventName } from 'utils';

const Etherscan = dynamic(() => import('icons').then((mod) => mod.Etherscan));

const EventHistory = ({
  type,
  count,
}: {
  type: 'tree' | 'hat';
  count?: number;
}) => {
  const { chainId, treeEvents } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { isClient } = useMediaStyles();
  const { isOpen, onToggle } = useDisclosure();
  let events = type === 'tree' ? treeEvents : selectedHat?.events;
  if (count) {
    events = _.take(events, count);
  }

  if (!events || !isClient) {
    return null;
  }

  const shouldCollapse = events.length > 5 && type === 'hat';
  let displayedEvents = events;
  let lastEvent = _.last(events);
  if (shouldCollapse) {
    if (!isOpen) {
      displayedEvents = _.take(events, 4);
    } else {
      lastEvent = undefined;
    }
  }

  return (
    <Box>
      {_.map(displayedEvents, (event: HatsEvent) => (
        <Event
          key={`${event.transactionID}-${event.id}`}
          event={event}
          chainId={chainId}
        />
      ))}

      {shouldCollapse && !isOpen && (
        <Flex justify='center' w='100px'>
          <Icon as={IoEllipsisVerticalSharp} />
        </Flex>
      )}

      {shouldCollapse && lastEvent && !isOpen && (
        <Event event={lastEvent} chainId={chainId} />
      )}

      {shouldCollapse && (
        <Button
          onClick={onToggle}
          size={{ base: 'xs', md: 'sm' }}
          variant='outline'
        >
          {isOpen ? 'Show Less' : `Show All (${events.length - 1})`}
        </Button>
      )}
    </Box>
  );
};

const Event = ({ event, chainId }: { event: HatsEvent; chainId?: number }) => {
  const eventName = _.first(_.get(event, 'id')?.split('-'));

  if (!eventName) return null;
  const eventDisplayName = parseEventName(eventName);

  return (
    <Flex
      key={`${event.transactionID}-${event.id}`}
      align='center'
      justify='space-between'
      py={2}
    >
      <Text color='blackAlpha.800'>{eventDisplayName}</Text>

      <ChakraNextLink
        isExternal
        href={`${chainId && explorerUrl(chainId)}/tx/${event.transactionID}`}
        display='block'
      >
        <HStack color='blue.500' justify='center'>
          <Text>
            {`${formatDistanceToNow(
              new Date(Number(event.timestamp) * 1000),
            )} ago`}
          </Text>
          <Icon as={Etherscan} />
        </HStack>
      </ChakraNextLink>
    </Flex>
  );
};

export default EventHistory;

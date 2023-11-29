import { Box, Button, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import { useState } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useIsClient from '@/hooks/useIsClient';
import { explorerUrl } from '@/lib/chains';
import { HatEvent } from '@/types';

const EventHistory = ({
  type,
  count,
}: {
  type: 'tree' | 'hat';
  count?: number;
}) => {
  const { chainId, selectedHat, treeEvents } = useTreeForm();
  const isClient = useIsClient();
  const [isCollapsed, setIsCollapsed] = useState(true);
  let events = type === 'tree' ? treeEvents : selectedHat?.events;
  if (count) {
    events = _.take(events, count);
  }

  if (!events || !isClient) {
    return null;
  }

  const shouldCollapse = events.length > 5 && type === 'hat';
  const displayedEvents =
    shouldCollapse && isCollapsed ? _.take(events, 4) : events;
  const lastEvent = shouldCollapse && isCollapsed ? _.last(events) : null;

  return (
    <Box>
      {_.map(displayedEvents, (event: HatEvent) => (
        <Event
          key={`${event.transactionID}-${event.id}`}
          event={event}
          chainId={chainId}
        />
      ))}

      {shouldCollapse && isCollapsed && (
        <Flex justify='center' w='100px'>
          <IoEllipsisVerticalSharp />
        </Flex>
      )}

      {lastEvent && isCollapsed && (
        <Event event={lastEvent} chainId={chainId} />
      )}

      {shouldCollapse && (
        <Button onClick={() => setIsCollapsed(!isCollapsed)} size='sm'>
          {isCollapsed ? `Show All (${events.length - 1})` : 'Show Less'}
        </Button>
      )}
    </Box>
  );
};

const Event = ({ event, chainId }: { event: HatEvent; chainId?: number }) => {
  return (
    <Flex
      key={`${event.transactionID}-${event.id}`}
      align='center'
      justify='space-between'
      py={2}
    >
      <Text>{`${formatDistanceToNow(
        new Date(Number(event.timestamp) * 1000),
      )} ago`}</Text>

      <ChakraNextLink
        isExternal
        href={`${chainId && explorerUrl(chainId)}/tx/${event.transactionID}`}
        display='block'
      >
        <HStack spacing={3}>
          <Text>{event.id?.split('-')[0]}</Text>
          <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
        </HStack>
      </ChakraNextLink>
    </Flex>
  );
};

export default EventHistory;

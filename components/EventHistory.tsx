import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { explorerUrl } from '@/lib/web3';
import { IHatEvent } from '@/types';

const EventHistory = ({
  type,
  count,
}: {
  type: 'tree' | 'hat';
  count?: number;
}) => {
  const { chainId, selectedHat, treeEvents } = useTreeForm();

  let events = type === 'tree' ? treeEvents : selectedHat?.events;
  if (count) {
    events = _.take(events, count);
  }

  if (!events) {
    return null;
  }

  return (
    <Box>
      {_.map(events, (event: IHatEvent) => (
        <Flex
          key={`${event?.transactionID}-${event?.id}`}
          align='center'
          justify='space-between'
          py={2}
        >
          <Text>{`${formatDistanceToNow(
            new Date(Number(event?.timestamp) * 1000),
          )} ago`}</Text>

          <ChakraNextLink
            isExternal
            href={`${chainId && explorerUrl(chainId)}/tx/${
              event?.transactionID
            }`}
            display='block'
          >
            <HStack spacing={3}>
              <Text>{event?.id?.split('-')[0]}</Text>
              <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
            </HStack>
          </ChakraNextLink>
        </Flex>
      ))}
    </Box>
  );
};

export default EventHistory;

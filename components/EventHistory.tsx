import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { explorerUrl } from '@/lib/web3';

const EventHistory = ({
  chainId,
  events,
}: {
  chainId: number;
  events: any;
}) => (
  <Box>
    {events?.map((event: any) => (
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
          href={`${explorerUrl(chainId)}/tx/${event?.transactionID}`}
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

export default EventHistory;

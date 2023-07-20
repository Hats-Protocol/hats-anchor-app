import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { explorerUrl } from '@/lib/web3';
import { IHatEvent } from '@/types';

const EventHistory = ({
  chainId,
  events,
}: {
  chainId: number;
  events: IHatEvent[];
}) => (
  <Stack>
    <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
      Event history
    </Heading>
    <Box>
      {events?.map((event: IHatEvent) => (
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
  </Stack>
);

export default EventHistory;

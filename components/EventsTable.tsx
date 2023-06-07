import {
  HStack,
  Icon,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import React from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

import { explorerUrl } from '@/lib/general';
import { decimalId, prettyIdToIp, prettyIdToUrlId } from '@/lib/hats';

const EventsTable = ({
  treeId,
  events,
  chainId,
  includeHatId,
}: EventsTableProps) => (
  <Table>
    <Tbody>
      {events.map((event: any) => (
        <Tr key={`${event?.transactionID}-${event?.id}`}>
          <Td p={2}>
            <Text>{`${formatDistanceToNow(
              new Date(Number(event?.timestamp) * 1000),
            )} ago`}</Text>
          </Td>
          <Td p={2}>
            <Link
              isExternal
              href={`${explorerUrl(chainId)}/tx/${event?.transactionID}`}
              display='block'
            >
              <HStack spacing={3}>
                <Text>{event?.id?.split('-')[0]}</Text>
                <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
              </HStack>
            </Link>
          </Td>
          {includeHatId && (
            <Td p={2}>
              <Link
                href={`/trees/${chainId}/${decimalId(treeId)}/${prettyIdToUrlId(
                  _.get(event, 'hat.prettyId'),
                )}`}
              >
                <Text color='gray.500' fontSize='sm'>
                  #{prettyIdToIp(_.get(event, 'hat.prettyId'))}
                </Text>
              </Link>
            </Td>
          )}
        </Tr>
      ))}
    </Tbody>
  </Table>
);

export default EventsTable;

interface EventsTableProps {
  treeId: string;
  events: any;
  chainId: number;
  includeHatId?: boolean;
}

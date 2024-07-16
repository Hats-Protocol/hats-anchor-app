'use client';

import {
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTreasury } from 'contexts';
import { useSuperfluidStreams } from 'hooks';
import { isEmpty, map } from 'lodash';
import { formatAddress } from 'utils';
import { formatUnits } from 'viem';

const SECONDS_IN_DAY = 86400;

const StreamsOverview = () => {
  const { safes, chainId } = useTreasury();

  const { data: streams } = useSuperfluidStreams({
    addresses: safes,
    chainId,
  });

  if (isEmpty(streams)) return null;

  return (
    <Flex justify='center'>
      <Card minW='500px'>
        <CardBody>
          <Stack justify='center'>
            <Heading size='lg' textAlign='center'>
              Active Streams
            </Heading>

            {map(streams, (stream: any) => {
              return (
                <Flex justify='space-between' key={stream.id}>
                  <Text>to {formatAddress(stream.receiver.id)}</Text>

                  <Text>
                    {formatUnits(
                      BigInt(stream.currentFlowRate) * BigInt(SECONDS_IN_DAY),
                      stream.token.decimals || 18,
                    )}{' '}
                    {stream.token.symbol} per day
                  </Text>
                </Flex>
              );
            })}
          </Stack>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default StreamsOverview;

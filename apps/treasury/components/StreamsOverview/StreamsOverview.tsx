'use client';

import { Card, CardBody, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useTreasury } from 'contexts';
import { useSuperfluidStreams } from 'hooks';
import { get, isEmpty, map } from 'lodash';
import { formatAddress, formatRoundedDecimals } from 'utils';

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
      <Card w={{ base: '80%', md: '60%' }} minW={{ md: '500px' }}>
        <CardBody>
          <Stack justify='center'>
            <Heading size='lg' textAlign='center'>
              Active Streams
            </Heading>

            {map(streams, (stream: any) => {
              return (
                <Flex
                  justify='space-between'
                  key={`${stream.currentFlowRate}-${stream.receiver.id}`}
                >
                  <Text>to {formatAddress(stream.receiver.id)}</Text>

                  <Text>
                    {formatRoundedDecimals({
                      value:
                        BigInt(stream.currentFlowRate) * BigInt(SECONDS_IN_DAY),
                      decimals: stream.token.decimals,
                    })}{' '}
                    {get(stream, 'token.symbol')} per day
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

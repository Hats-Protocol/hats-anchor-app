'use client';

import { Divider, Flex, Stack, Text } from '@chakra-ui/react';
import { useTreasury } from 'contexts';
import { useSuperfluidStreams } from 'hooks';
import { isEmpty, map, toLower } from 'lodash';
import { formatAddress, formatRoundedDecimals } from 'utils';
import { Hex } from 'viem';

const SECONDS_IN_MONTH = 86_400 * 30;

const CUSTOM_NAMES: { [key: string]: string } = {
  '0x181ebdb03cb4b54f4020622f1b0eacd67a8c63ac': 'Raid Guild DAO',
};

const ActiveStreams = ({ safeAddress }: { safeAddress: Hex }) => {
  const { chainId } = useTreasury();
  const { data: streams } = useSuperfluidStreams({
    addresses: [safeAddress],
    chainId,
  });

  if (isEmpty(streams)) return null;

  return (
    <Stack>
      {map(streams, (stream: any) => (
        <Flex align='center' justify='space-between' gap={2}>
          <Text maxW='60px' size='sm'>
            Inbound Stream
          </Text>

          <Stack spacing={0} align='center'>
            <Text variant='medium'>
              {formatRoundedDecimals({
                value: BigInt(stream.currentFlowRate) * BigInt(SECONDS_IN_MONTH),
                decimals: stream.token.decimals,
              })}{' '}
              {stream.token.symbol}
            </Text>

            <Text size='xs'>per month</Text>
          </Stack>

          <Stack spacing={0} align='center' maxW='100px'>
            <Text size='xs'>from</Text>
            <Text size='sm' variant='medium' textAlign='center'>
              {CUSTOM_NAMES[toLower(stream.sender.id)] || formatAddress(stream.sender.id)}
            </Text>
          </Stack>
        </Flex>
      ))}

      <Divider maxW='40%' mx='auto' pt={4} />
    </Stack>
  );
};

export { ActiveStreams };

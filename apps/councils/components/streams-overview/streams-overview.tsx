'use client';

import { useTreasury } from 'contexts';
import { useSuperfluidStreams } from 'hooks';
import { get, isEmpty, map } from 'lodash';
import { Card } from 'ui';
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
    <div className='flex justify-center'>
      <Card className='w-[80%] min-w-[500px]'>
        <div className='p-4'>
          <div className='flex justify-center'>
            <h2 className='text-2xl font-bold'>Active Streams</h2>

            {map(streams, (stream: any) => {
              return (
                <div className='flex justify-between' key={`${stream.currentFlowRate}-${stream.receiver.id}`}>
                  <p>to {formatAddress(stream.receiver.id)}</p>

                  <p>
                    {formatRoundedDecimals({
                      value: BigInt(stream.currentFlowRate) * BigInt(SECONDS_IN_DAY),
                      decimals: stream.token.decimals,
                    })}{' '}
                    {get(stream, 'token.symbol')} per day
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export { StreamsOverview };

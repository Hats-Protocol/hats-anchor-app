'use client';

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
    <div className='flex flex-col gap-4'>
      {map(streams, (stream: any) => (
        <div className='flex items-center justify-between gap-2'>
          <p className='max-w-[60px] text-sm'>Inbound Stream</p>

          <div className='flex flex-col items-center'>
            <p className='text-sm font-medium'>
              {formatRoundedDecimals({
                value: BigInt(stream.currentFlowRate) * BigInt(SECONDS_IN_MONTH),
                decimals: stream.token.decimals,
              })}{' '}
              {stream.token.symbol}
            </p>

            <p className='text-xs'>per month</p>
          </div>

          <div className='flex max-w-[100px] flex-col items-center'>
            <p className='text-xs'>from</p>
            <p className='text-center text-sm font-medium'>
              {CUSTOM_NAMES[toLower(stream.sender.id)] || formatAddress(stream.sender.id)}
            </p>
          </div>
        </div>
      ))}

      <hr className='mx-auto max-w-[40%] pt-4' />
    </div>
  );
};

export { ActiveStreams };

'use client';

import { chainsList } from '@hatsprotocol/config';
import { useSubgraphCheck } from 'hooks';
import { first, map, pick, trim, truncate, values } from 'lodash';
import { useMemo } from 'react';
import { SupportedChains } from 'types';
import { cn, Skeleton } from 'ui';
import { Chain } from 'viem';

// TODO why isn't this importing from utils?
const chainsMap = (chainId?: number) =>
  chainId ? chainsList[chainId as SupportedChains] : (first(values(chainsList)) as Chain);

const SubgraphCheck = ({ chainId }: { chainId: number }) => {
  const { data, isLoading } = useSubgraphCheck(chainId);
  const {
    mainSubgraph,
    mainSubgraphOutOfSync,
    mainVersion,
    ancillarySubgraph,
    ancillarySubgraphOutOfSync,
    ancillaryVersion,
    chain,
  } = pick(data, [
    'mainSubgraph',
    'mainSubgraphOutOfSync',
    'mainVersion',
    'ancillarySubgraph',
    'ancillarySubgraphOutOfSync',
    'ancillaryVersion',
    'chain',
  ]);

  const SUBGRAPHS = useMemo(
    () => [
      {
        name: 'Main Subgraph',
        value: mainSubgraph,
        outOfSync: mainSubgraphOutOfSync,
        version: mainVersion,
      },
      {
        name: 'Ancillary Subgraph',
        value: ancillarySubgraph,
        outOfSync: ancillarySubgraphOutOfSync,
        version: ancillaryVersion,
      },
    ],
    [mainSubgraph, mainSubgraphOutOfSync, mainVersion, ancillarySubgraph, ancillarySubgraphOutOfSync, ancillaryVersion],
  );

  if (isLoading || !data) return <Skeleton className='h-[100px] w-full' />;

  return (
    <div key={chainId} className='flex flex-col items-center gap-2 border-b border-black pb-4'>
      <div className='flex w-full justify-between gap-4'>
        <h3 className='text-lg font-semibold'>{chainsMap(chainId)?.name}</h3>

        <div className='w-[100px] text-right'>{chain}</div>
      </div>

      {map(SUBGRAPHS, ({ name, value, outOfSync, version }) => {
        return (
          <div className='flex w-full justify-between gap-4' key={name}>
            <div className='flex w-[300px] items-center gap-2'>
              <h5 className='text-sm'>{name}</h5>
              {version && <p className='text-sm text-gray-500'>- {trim(truncate(version, { length: 18 }))}</p>}
            </div>

            <div className={cn('w-[100px] text-right', outOfSync || !value ? 'font-medium text-red-500' : '')}>
              {value || 'Crashed'}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { SubgraphCheck };

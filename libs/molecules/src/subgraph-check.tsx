'use client';

import { chainsList } from '@hatsprotocol/constants';
import { useSubgraphCheck } from 'hooks';
import { first, map, pick, values } from 'lodash';
import { useMemo } from 'react';
import { SupportedChains } from 'types';
import { cn, Skeleton } from 'ui';
import { Chain } from 'viem';

// TODO why isn't this importing from utils?
const chainsMap = (chainId?: number) =>
  chainId
    ? chainsList[chainId as SupportedChains]
    : (first(values(chainsList)) as Chain);

export const SubgraphCheck = ({ chainId }: { chainId: number }) => {
  const { data } = useSubgraphCheck(chainId);
  const {
    mainSubgraph,
    mainSubgraphOutOfSync,
    ancillarySubgraph,
    ancillarySubgraphOutOfSync,
    chain,
  } = pick(data, [
    'mainSubgraph',
    'mainSubgraphOutOfSync',
    'ancillarySubgraph',
    'ancillarySubgraphOutOfSync',
    'chain',
  ]);

  const SUBGRAPHS = useMemo(
    () => [
      {
        name: 'Main Subgraph',
        value: mainSubgraph,
        outOfSync: mainSubgraphOutOfSync,
      },
      {
        name: 'Ancillary Subgraph',
        value: ancillarySubgraph,
        outOfSync: ancillarySubgraphOutOfSync,
      },
    ],
    [
      mainSubgraph,
      mainSubgraphOutOfSync,
      ancillarySubgraph,
      ancillarySubgraphOutOfSync,
    ],
  );

  if (!data) return <Skeleton className='h-[100px] w-full' />;

  return (
    <div
      key={chainId}
      className='flex flex-col items-center gap-2 border-b border-black pb-4'
    >
      <div className='flex w-full justify-between gap-4'>
        <h3 className='text-lg font-semibold'>{chainsMap(chainId)?.name}</h3>

        <div className='w-[100px] text-right'>{chain}</div>
      </div>

      {map(SUBGRAPHS, ({ name, value, outOfSync }) => {
        return (
          <div className='flex w-full justify-between gap-4'>
            <h5 className='w-[150px] text-sm'>{name}</h5>

            <div
              className={cn(
                'w-[100px] text-right',
                outOfSync ? 'font-medium text-red-500' : '',
              )}
            >
              {value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

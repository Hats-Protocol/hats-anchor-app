'use client';

import { SHOW_KEY } from '@hatsprotocol/constants';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { usePaginatedTreeList } from 'hats-hooks';
import { useWearerTrees } from 'hooks';
import { flatten, get, isEmpty, map, size, toNumber } from 'lodash';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LinkButton, Skeleton, Spinner } from 'ui';
import { chainsMap } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const TreeCard = dynamic(() => import('molecules').then((mod) => mod.TreeListCard));

const LOADING_TREES = Array(20).fill({});

const TreesList = ({ params }: TreeListProps) => {
  const { chainId: chainIdParam } = params;
  const chainId = toNumber(chainIdParam);
  const chain = chainsMap(chainId);
  const queryParams = useSearchParams();
  const { address } = useAccount();

  const showKey = queryParams.get('show');

  const { data: wearerTrees, isLoading: wearerTreesLoading } = useWearerTrees({
    chainId,
    wearer: address as Hex,
    enabled: !!address && !!chainId,
  });

  const {
    data: paginatedTrees,
    fetchNextPage,
    hasNextPage,
    isLoading: treesLoading,
  } = usePaginatedTreeList({
    chainId,
    enabled: !address || showKey === SHOW_KEY.all,
  });

  const trees = flatten(get(paginatedTrees, 'pages'));
  const currentTrees = useMemo(() => {
    if (showKey !== SHOW_KEY.all && address) return wearerTrees;
    return trees;
  }, [showKey, address, trees, wearerTrees]);

  if (
    (showKey === SHOW_KEY.all && isEmpty(trees) && !treesLoading) ||
    (address && (!showKey || showKey === SHOW_KEY.me) && isEmpty(wearerTrees) && !wearerTreesLoading)
  ) {
    return (
      <div className='flex h-full min-h-[600px] items-center justify-center'>
        <div className='flex flex-col items-center gap-10'>
          <h2 className='text-lg font-medium'>
            {!showKey || showKey === SHOW_KEY.me ? "You're not wearing any hats on this network" : 'No trees found'}
          </h2>

          {(!showKey || showKey === SHOW_KEY.me) && (
            <LinkButton href={`/trees/${chainId}?show=all`}>Show all trees on {chain?.name}</LinkButton>
          )}
        </div>
      </div>
    );
  }

  if (treesLoading || wearerTreesLoading) {
    return (
      <div className='mx-auto grid max-w-[1200px] grid-cols-1 justify-center gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4'>
        {map(LOADING_TREES, (_, i) => {
          return <Skeleton key={i} className='w-100 h-[132px] rounded-md' />;
        })}
      </div>
    );
  }

  return (
    <InfiniteScroll
      hasChildren={!isEmpty(trees)}
      dataLength={size(trees)}
      next={fetchNextPage}
      hasMore={((showKey === SHOW_KEY.all || !address) && hasNextPage) || false}
      loader={
        <div className='flex items-center justify-center pt-10'>
          <Spinner />
        </div>
      }
    >
      <div className='mx-auto grid max-w-[1200px] grid-cols-1 justify-center gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4'>
        {map(currentTrees, (tree: Tree) => (
          <TreeCard key={tree.id} tree={tree} chainId={chainId} />
        ))}
      </div>
    </InfiniteScroll>
  );
};

interface TreeListProps {
  params: { chainId: string };
  // initialTrees: any[];
}

export { TreesList };

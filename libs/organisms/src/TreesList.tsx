'use client';

import { Flex, Heading, SimpleGrid, Spinner, Stack } from '@chakra-ui/react';
import { SHOW_KEY } from '@hatsprotocol/constants';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { usePaginatedTreeList } from 'hats-hooks';
import { useWearerTrees } from 'hooks';
import { flatten, get, isEmpty, map, size, toNumber } from 'lodash';
import { TreeListCard as TreeCard } from 'molecules';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LinkButton, Skeleton } from 'ui';
import { chainsMap } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

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
    (address &&
      (!showKey || showKey === SHOW_KEY.me) &&
      isEmpty(wearerTrees) &&
      !wearerTreesLoading)
  ) {
    return (
      <Flex justify='center' align='center' h='full' minH='600px'>
        <Stack spacing={10} align='center'>
          <Heading>
            {!showKey || showKey === SHOW_KEY.me
              ? "You're not wearing any hats on this network"
              : 'No trees found'}
          </Heading>

          {(!showKey || showKey === SHOW_KEY.me) && (
            <LinkButton href={`/trees/${chainId}?show=all`} variant='primary'>
              Show all trees on {chain?.name}
            </LinkButton>
          )}
        </Stack>
      </Flex>
    );
  }

  if (treesLoading || wearerTreesLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 justify-center mx-auto max-w-[1200px] gap-4 sm:gap-6'>
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
        <Flex justify='center' align='center' pt={10}>
          <Spinner />
        </Flex>
      }
    >
      <SimpleGrid
        gap={{
          base: 4,
          sm: 8,
        }}
        justifyContent='center'
        columns={{
          base: 1,
          md: 3,
          lg: 4,
        }}
        maxW='1200px'
        mx='auto'
      >
        {map(currentTrees, (tree: Tree) => (
          <TreeCard key={tree.id} tree={tree} chainId={chainId} />
        ))}
      </SimpleGrid>
    </InfiniteScroll>
  );
};

interface TreeListProps {
  params: { chainId: string };
  // initialTrees: any[];
}

export default TreesList;

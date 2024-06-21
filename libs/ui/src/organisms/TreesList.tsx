'use client';

import { Flex, Heading, SimpleGrid, Spinner } from '@chakra-ui/react';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { usePaginatedTreeList } from 'hats-hooks';
import { useImageURIs } from 'hooks';
import _ from 'lodash';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { mapWithChainId } from 'shared';
import { AppHat } from 'types';

import { Skeleton } from '../atoms';
import TreeCard from '../cards/TreeListCard';

const LOADING_TREES = Array(20).fill({});

const TreesList = ({
  params,
  initialTrees,
}: {
  params: { chainId: string };
  initialTrees: any[];
}) => {
  const { chainId: chainIdParam } = params;
  const chainId = _.toNumber(chainIdParam);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: treesLoading,
  } = usePaginatedTreeList({
    chainId,
  });

  const trees = _.flatten(_.get(data, 'pages'));

  const topHats = useMemo(() => {
    return mapWithChainId(
      _.map(_.flatten(_.get(data, 'pages')), 'hats[0]'),
      chainId,
    ) as AppHat[];
  }, [data, chainId]);

  const { data: topHatsWithImagesData } = useImageURIs({
    hats: topHats,
  });

  if (_.isEmpty(trees) && !treesLoading) {
    return (
      <Flex justify='center' align='center' h='100vh'>
        <Heading>No trees found</Heading>
      </Flex>
    );
  }

  if (treesLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 justify-center mx-auto max-w-[1200px] gap-4 sm:gap-6'>
        {_.map(LOADING_TREES, (tree: Tree, i) => {
          return <Skeleton key={i} className='w-100 h-[132px] rounded-md' />;
        })}
      </div>
    );
  }

  return (
    <InfiniteScroll
      hasChildren={!_.isEmpty(trees)}
      dataLength={_.size(trees)}
      next={fetchNextPage}
      hasMore={hasNextPage || false}
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
        {_.map(trees, (tree: Tree) => {
          const topHat = _.find(
            topHats,
            (h: AppHat) =>
              _.get(h, 'id') === _.get(_.first(_.get(tree, 'hats')), 'id'),
          );
          const topHatImage = _.find(
            topHatsWithImagesData,
            (h: AppHat) =>
              _.get(h, 'id') === _.get(_.first(_.get(tree, 'hats')), 'id'),
          );

          if (!topHat || !tree) return null;

          return (
            <TreeCard
              key={tree.id}
              tree={tree}
              topHat={topHat}
              topHatImage={topHatImage}
            />
          );
        })}
      </SimpleGrid>
    </InfiniteScroll>
  );
};

export default TreesList;

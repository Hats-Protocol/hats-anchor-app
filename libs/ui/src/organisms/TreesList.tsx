'use client';

import { Flex, Heading, SimpleGrid, Spinner } from '@chakra-ui/react';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { usePaginatedTreeList } from 'hats-hooks';
import { useImageURIs } from 'hooks';
import _ from 'lodash';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { mapWithChainId } from 'shared';
import { AppHat } from 'types';

import TreeCard from '../cards/TreeListCard';

const TreesList = ({ initialTrees }: { initialTrees: any[] }) => {
  const pathname = usePathname();
  const chainId = _.toNumber(_.nth(pathname.split('/'), 2));

  const { data, fetchNextPage, hasNextPage } = usePaginatedTreeList({
    chainId,
  });

  const trees = _.flatten(_.get(data, 'pages'));

  const topHats = useMemo(() => {
    return mapWithChainId(
      _.map(_.flatten(_.get(data, 'pages')), 'hats[0]'),
      chainId,
    ) as AppHat[];
  }, [data, chainId]);

  const { data: topHatsWithImagesData } = useImageURIs({ hats: topHats });

  if (_.isEmpty(trees)) {
    return (
      <Flex justify='center' align='center'>
        <Heading size='md'>No Trees Found</Heading>
      </Flex>
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

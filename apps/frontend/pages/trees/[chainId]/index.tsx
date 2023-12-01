import { Box, Flex, Heading, SimpleGrid, Spinner } from '@chakra-ui/react';
import _ from 'lodash';
import { GetStaticPropsContext } from 'next';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import Layout from '@/components/Layout';
import NetworkFilter from '@/components/NetworkFilter';
import TreeCard from '@/components/TreeListCard';
import useImageURIs from '@/hooks/useImageURIs';
import usePaginatedTreeList from '@/hooks/usePaginatedTreeList';
import { mapWithChainId } from '@/lib/general';
import { Hat, Tree } from '@/types';

const Trees = ({ chainId }: { chainId: number }) => {
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    usePaginatedTreeList({
      chainId,
    });

  const trees = _.flatten(_.get(data, 'pages'));

  const topHats: Hat[] = useMemo(() => {
    return mapWithChainId(
      _.map(_.flatten(_.get(data, 'pages')), 'hats[0]'),
      chainId,
    );
  }, [data, chainId]);

  const { data: topHatsWithImagesData, isLoading: imagesLoading } =
    useImageURIs({ hats: topHats });

  return (
    <Layout>
      <Box w='100%' h='100%' bg='blue' position='fixed' opacity={0.05} />
      <Box py={100} px={100}>
        <Flex justifyContent='flex-end' mb={3} alignItems='center' gap={2}>
          <NetworkFilter selectedNetwork={chainId} />
        </Flex>
        {!isLoading && !_.isEmpty(trees) && (
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
              gap={8}
              justifyContent='center'
              columns={4}
              maxW='1200px'
              mx='auto'
            >
              {_.map(trees, (tree: Tree) => {
                const topHat = _.find(
                  topHats,
                  (h: Hat) =>
                    _.get(h, 'id') ===
                    _.get(_.first(_.get(tree, 'hats')), 'id'),
                );
                const topHatImage = _.find(
                  topHatsWithImagesData,
                  (h: Hat) =>
                    _.get(h, 'id') ===
                    _.get(_.first(_.get(tree, 'hats')), 'id'),
                );

                if (!topHat) return null;

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
        )}
        {_.isEmpty(trees) &&
          !isLoading &&
          !imagesLoading &&
          !isFetchingNextPage && (
            <Flex justify='center' align='center'>
              <Heading size='md'>No Trees Found</Heading>
            </Flex>
          )}
        {(isLoading || imagesLoading || isFetchingNextPage) &&
          _.isEmpty(trees) && (
            <Flex justify='center' align='center' pt={10}>
              <Spinner />
            </Flex>
          )}
      </Box>
    </Layout>
  );
};

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const chainId = _.get(context, 'params.chainId');

  return {
    props: {
      chainId,
    },
    revalidate: 30,
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default Trees;

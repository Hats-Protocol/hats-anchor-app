import { Box, Flex, Heading, SimpleGrid, Spinner } from '@chakra-ui/react';
import { InfiniteData } from '@tanstack/react-query';
import _ from 'lodash';
import { GetStaticPropsContext } from 'next';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import Layout from '@/components/Layout';
import NetworkFilter from '@/components/NetworkFilter';
import { fetchPaginatedTrees } from '@/gql/helpers';
import useImageURIs from '@/hooks/useImageURIs';
import usePaginatedTreeList from '@/hooks/usePaginatedTreeList';
import { IHat, ITree } from '@/types';

const TreeCard = dynamic(() => import('@/components/TreeCard'));

const Trees = ({
  trees: initialData,
  chainId,
}: {
  trees: InfiniteData<ITree[]>;
  chainId: number;
}) => {
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    usePaginatedTreeList({
      chainId,
      initialData,
    });
  const trees = _.flatten(_.get(data, 'pages'));

  const topHats = useMemo(() => {
    return _.map(_.flatten(_.get(data, 'pages')), 'hats[0]');
  }, [data]);

  const { data: topHatsWithImagesData, isLoading: imagesLoading } =
    useImageURIs(_.map(topHats, (h) => ({ ...h, chainId })));

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
            <SimpleGrid gap={8} justifyContent='center' columns={4}>
              {_.map(trees, (tree: ITree) => {
                const topHat = _.find(
                  topHats,
                  (h: IHat) =>
                    _.get(h, 'id') ===
                    _.get(_.first(_.get(tree, 'hats')), 'id'),
                );
                const topHatImage = _.find(
                  topHatsWithImagesData,
                  (h: IHat) =>
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

  try {
    const trees = await fetchPaginatedTrees(Number(chainId) || 1, 1, 40);

    return {
      props: {
        chainId,
        trees,
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return {
      props: {
        chainId: 1,
        trees: [],
      },
      revalidate: 30,
    };
  }
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default Trees;

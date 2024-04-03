import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { usePaginatedTreeList } from 'hats-hooks';
import { useImageURIs, useRudderStackAnalytics } from 'hooks';
import _ from 'lodash';
import { GetStaticPropsContext } from 'next';
import { useEffect, useMemo } from 'react';
import { BsDiagram3 } from 'react-icons/bs';
import InfiniteScroll from 'react-infinite-scroll-component';
import { mapWithChainId } from 'shared';
import { AppHat } from 'types';
import {
  ChakraNextLink,
  Layout,
  NetworkFilter,
  TreeListCard as TreeCard,
} from 'ui';
import { useAccount } from 'wagmi';

const Trees = ({ chainId }: { chainId: number }) => {
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    usePaginatedTreeList({
      chainId,
    });
  const { address } = useAccount();
  const analytics = useRudderStackAnalytics();

  const trees = _.flatten(_.get(data, 'pages'));

  const topHats = useMemo(() => {
    return mapWithChainId(
      _.map(_.flatten(_.get(data, 'pages')), 'hats[0]'),
      chainId,
    ) as AppHat[];
  }, [data, chainId]);

  const { data: topHatsWithImagesData, isLoading: imagesLoading } =
    useImageURIs({ hats: topHats });

  useEffect(() => {
    if (analytics && chainId) {
      analytics.page('Auto Track', 'Trees Page', {
        chainId,
        isConnected: !!address,
        anonymousId: address || analytics.getAnonymousId(),
      });
    }
  }, [analytics, chainId, address]);

  return (
    <Layout>
      <Box w='100%' h='100%' bg='blue' position='fixed' opacity={0.05} />
      <Box
        py={{
          base: 16,
          lg: 100,
        }}
        px={{
          base: 4,
          md: 20,
          lg: 100,
        }}
      >
        <Flex justifyContent='flex-end' mb={3} alignItems='center' gap={2}>
          <HStack>
            <ChakraNextLink href='/trees/new'>
              <Button
                colorScheme='blue.500'
                bg='gray.50'
                variant='outlineMatch'
              >
                <HStack>
                  <BsDiagram3 />
                  <Text variant='medium' noOfLines={1}>
                    Create a new {CONFIG.tree}
                  </Text>
                </HStack>
              </Button>
            </ChakraNextLink>
            <NetworkFilter selectedNetwork={chainId} />
          </HStack>
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
                    _.get(h, 'id') ===
                    _.get(_.first(_.get(tree, 'hats')), 'id'),
                );
                const topHatImage = _.find(
                  topHatsWithImagesData,
                  (h: AppHat) =>
                    _.get(h, 'id') ===
                    _.get(_.first(_.get(tree, 'hats')), 'id'),
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
  const chainId = _.toNumber(_.get(context, 'params.chainId'));

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

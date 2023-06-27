import _ from 'lodash';
import { Heading, SimpleGrid, Flex, Spinner, Box } from '@chakra-ui/react';
import { useState, useCallback, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { InfiniteData } from '@tanstack/react-query';

import Layout from '@/components/Layout';
import useImageURIs from '@/hooks/useImageURIs';
import NetworkFilter from '@/components/NetworkFilter';
import TreeCard from '@/components/TreeCard';
import { fetchPaginatedTrees } from '@/gql/helpers';
import usePaginatedTreeList from '@/hooks/usePaginatedTreeList';
import { IHat, ITree } from '@/types';

const Trees = ({
  trees: initialData,
  defaultNetworkId,
}: {
  trees: InfiniteData<ITree[]>;
  defaultNetworkId: number;
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState(defaultNetworkId);

  const handleNetworkFilterChange = useCallback(
    (networkId: number) => {
      setSelectedNetwork(networkId);
    },
    [setSelectedNetwork],
  );

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    usePaginatedTreeList({
      chainId: selectedNetwork,
      initialData,
    });
  const trees = _.flatten(_.get(data, 'pages'));

  const topHats = useMemo(() => {
    return _.map(_.flatten(_.get(data, 'pages')), 'hats[0]');
  }, [data]);

  const { data: topHatsWithImagesData, isLoading: imagesLoading } =
    useImageURIs(_.map(topHats, (h) => ({ ...h, chainId: selectedNetwork })));

  return (
    <Layout>
      <Box w='100%' h='100%' bg='blue' position='fixed' opacity={0.05} />
      <Box py={100} px={100}>
        <Flex justifyContent='flex-end' mb={3} alignItems='center' gap={2}>
          <NetworkFilter
            onFilterChange={handleNetworkFilterChange}
            selectedNetwork={selectedNetwork}
          />
        </Flex>
        {!isLoading && !imagesLoading && !_.isEmpty(trees) && (
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
                  topHatsWithImagesData,
                  (h: IHat) =>
                    _.get(h, 'id') ===
                    _.get(_.first(_.get(tree, 'hats')), 'id'),
                );

                if (!topHat) return null;

                return <TreeCard key={tree.id} tree={tree} topHat={topHat} />;
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
        {(isLoading || imagesLoading) && (
          <Flex justify='center' align='center' pt={10}>
            <Spinner />
          </Flex>
        )}
      </Box>
    </Layout>
  );
};

export const getStaticProps = async () => {
  try {
    const defaultNetworkId = process.env.NODE_ENV === 'production' ? 1 : 5;
    const trees = await fetchPaginatedTrees(defaultNetworkId, 1, 20);

    return {
      props: {
        defaultNetworkId,
        trees,
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return {
      props: {
        defaultNetworkId: 1,
        trees: [],
      },
    };
  }
};

export default Trees;

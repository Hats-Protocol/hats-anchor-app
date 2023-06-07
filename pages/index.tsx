import _ from 'lodash';
import { Heading, SimpleGrid, Flex, Spinner } from '@chakra-ui/react';
import { useState, useCallback, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import Layout from '@/components/Layout';
import useImageURIs from '@/hooks/useImageURIs';
import NetworkFilter from '@/components/NetworkFilter';
import TreeCard from '@/components/TreeCard';
import HeadComponent from '@/components/HeadComponent';
import { fetchPaginatedTrees } from '@/gql/helpers';
import usePaginatedTreeList from '@/hooks/usePaginatedTreeList';

const Home = ({
  trees: initialData,
  defaultNetworkId,
}: {
  trees: any[];
  defaultNetworkId: number;
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState(defaultNetworkId);

  const handleNetworkFilterChange = useCallback(
    (networkId: number) => {
      setSelectedNetwork(networkId);
    },
    [setSelectedNetwork],
  );

  const { trees, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    usePaginatedTreeList({
      chainId: selectedNetwork,
      initialData,
    });

  const topHatIds = useMemo(() => {
    return _.map(_.flatten(_.get(trees, 'pages')), 'hats[0].id');
  }, [trees]);

  const { data: imagesData } = useImageURIs(topHatIds, selectedNetwork);

  return (
    <Layout>
      <HeadComponent />

      <Flex justifyContent='flex-end' mb={3} alignItems='center' gap={2}>
        <NetworkFilter
          onFilterChange={handleNetworkFilterChange}
          selectedNetwork={selectedNetwork}
        />
      </Flex>
      {trees && (
        <InfiniteScroll
          dataLength={_.size(_.flatten(_.get(trees, 'pages')))}
          next={fetchNextPage}
          hasMore={hasNextPage || false}
          loader={<Spinner />}
        >
          <SimpleGrid gap={5} justifyContent='center' minChildWidth='250px'>
            {_.map(_.get(trees, 'pages'), (tree: any) => (
              <TreeCard key={tree.id} tree={tree} imagesData={imagesData} />
            ))}
          </SimpleGrid>
        </InfiniteScroll>
      )}
      {!_.isEmpty(_.get(trees, 'pages')) &&
        !(isLoading || isFetchingNextPage) && (
          <Flex justify='center' align='center'>
            <Heading size='md'>No Trees Found</Heading>
          </Flex>
        )}
      {(isLoading || isFetchingNextPage) && (
        <Flex justify='center' align='center' pt={10}>
          <Spinner />
        </Flex>
      )}
    </Layout>
  );
};

export const getStaticProps = async () => {
  const defaultNetworkId = process.env.NODE_ENV === 'production' ? 1 : 5;
  const trees = await fetchPaginatedTrees(defaultNetworkId, 1, 20);

  return {
    props: {
      defaultNetworkId,
      trees,
    },
  };
};

export default Home;

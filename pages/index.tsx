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

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    usePaginatedTreeList({
      chainId: selectedNetwork,
      initialData,
    });
  const trees = useMemo(() => {
    return _.flatten(_.get(data, 'pages'));
  }, [data]);

  const topHatIds = useMemo(() => {
    return _.map(_.flatten(_.get(data, 'pages')), 'hats[0].id');
  }, [data]);

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
      {!_.isEmpty(trees) && (
        <InfiniteScroll
          dataLength={_.size(trees)}
          next={fetchNextPage}
          hasMore={hasNextPage || false}
          loader={
            <Flex justify='center' align='center' pt={10}>
              <Spinner />
            </Flex>
          }
        >
          <SimpleGrid gap={5} justifyContent='center' minChildWidth='250px'>
            {_.map(trees, (tree: any) => (
              <TreeCard key={tree.id} tree={tree} imagesData={imagesData} />
            ))}
          </SimpleGrid>
        </InfiniteScroll>
      )}
      {_.isEmpty(trees) && !(isLoading || isFetchingNextPage) && (
        <Flex justify='center' align='center'>
          <Heading size='md'>No Trees Found</Heading>
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

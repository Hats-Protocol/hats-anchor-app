import _ from 'lodash';
import { SimpleGrid, Flex, Heading, Spinner, Button } from '@chakra-ui/react';
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import Layout from '../components/Layout';
import useImageURIs from '../hooks/useImageURIs';
import NetworkFilter from '../components/NetworkFilter';
import TreeCard from '../components/TreeCard';
import { fetchPaginatedTrees } from '../gql/helpers';
import usePaginatedTreeList from '../hooks/usePaginatedTreeList';

const Home = ({ trees: initialData, defaultNetworkId }) => {
  const [selectedNetwork, setSelectedNetwork] = useState(defaultNetworkId);

  const handleNetworkFilterChange = (networkId) => {
    setSelectedNetwork(networkId);
  };

  const { trees, fetchNextPage, isEnd } = usePaginatedTreeList({
    chainId: selectedNetwork,
    initialData,
  });

  const topHatIds = _.map(trees, 'hats[0].id');
  const { data: imagesData } = useImageURIs(topHatIds, selectedNetwork);

  return (
    <Layout>
      <Flex justifyContent='flex-end' mb={3}>
        <NetworkFilter
          onFilterChange={handleNetworkFilterChange}
          selectedNetwork={selectedNetwork}
        />
      </Flex>
      {trees && (
        <InfiniteScroll dataLength={trees.length} next={fetchNextPage} hasMore>
          <SimpleGrid
            justify='center'
            templateColumns='repeat(auto-fit, 250px)'
            gap={5}
            justifyContent='center'
          >
            {_.map(trees, (tree) => (
              <TreeCard key={tree.id} tree={tree} imagesData={imagesData} />
            ))}
          </SimpleGrid>
        </InfiniteScroll>
      )}
      {trees && !isEnd && (
        <Flex w='full' justifyContent='center' mt={4}>
          <Button onClick={fetchNextPage}>Load more</Button>
        </Flex>
      )}
      {trees?.length === 0 && (
        <Flex justify='center' align='center'>
          <Heading size='md'>No Trees Found</Heading>
        </Flex>
      )}
      {!trees && (
        <Flex justify='center' align='center'>
          <Spinner />
        </Flex>
      )}
    </Layout>
  );
};

export default Home;

export const getServerSideProps = async () => {
  const defaultNetworkId = process.env.NODE_ENV === 'production' ? 1 : 5;
  const trees = await fetchPaginatedTrees(defaultNetworkId, 1, 20);

  return {
    props: {
      defaultNetworkId,
      trees,
    },
  };
};

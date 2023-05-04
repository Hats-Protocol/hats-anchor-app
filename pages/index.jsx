import _ from 'lodash';
import { SimpleGrid, Flex, Heading } from '@chakra-ui/react';
import { useState } from 'react';
import { useChainId } from 'wagmi';
import InfiniteScroll from 'react-infinite-scroll-component';
import Layout from '../components/Layout';
import useImageURIs from '../hooks/useImageURIs';
import NetworkFilter from '../components/NetworkFilter';
import TreeCard from '../components/TreeCard';
import usePaginatedTreeList from '../hooks/usePaginatedTreeList';

const Home = () => {
  const chainId = useChainId();
  const [selectedNetwork, setSelectedNetwork] = useState(chainId || 5);
  const [page, setPage] = useState(1);

  const handleNetworkFilterChange = (networkId) => {
    setSelectedNetwork(networkId);
    setPage(1);
  };

  const { trees } = usePaginatedTreeList({
    chainId: selectedNetwork,
    perPage: 20,
    page,
  });

  const tophats = _.map(trees, 'hats[0].id');
  const { data: imagesData } = useImageURIs(tophats, selectedNetwork);

  return (
    <Layout>
      <Flex justifyContent='flex-end' mb={3}>
        <NetworkFilter
          onFilterChange={handleNetworkFilterChange}
          selectedNetwork={selectedNetwork}
        />
      </Flex>
      {trees &&
        (trees.length > 0 ? (
          <InfiniteScroll
            dataLength={trees.length}
            next={() => setPage(page + 1)}
            hasMore
          >
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
        ) : (
          <Flex justify='center' align='center'>
            <Heading size='md'>No Trees Found</Heading>
          </Flex>
        ))}
    </Layout>
  );
};

export default Home;

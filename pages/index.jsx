import _ from 'lodash';
import { SimpleGrid, Flex, Text, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import InfiniteScroll from 'react-infinite-scroll-component';
import Layout from '../components/Layout';
import useImageURIs from '../hooks/useImageURIs';
import NetworkFilter from '../components/NetworkFilter';
import TreeCard from '../components/TreeCard';
import useFetchMoreTrees from '../hooks/useFetchMoreTrees';

const Home = () => {
  const chainId = useChainId();
  const [selectedNetwork, setSelectedNetwork] = useState(chainId || 5);
  const [displayedTrees, setDisplayedTrees] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSelectedNetwork(chainId);
  }, [chainId]);

  const handleNetworkFilterChange = (networkId) => {
    setSelectedNetwork(networkId);
  };

  const { trees, isLoading, error, hasMore } = useFetchMoreTrees(
    selectedNetwork,
    page,
  );

  useEffect(() => {
    setDisplayedTrees(trees);
  }, [trees]);

  const tophats = _.map(displayedTrees, 'hats[0].id');
  const { data: imagesData, loading } = useImageURIs(tophats, 1);

  const handleNextPage = () => {
    if (hasMore) {
      setPage(page + 1);
    }
  };

  return (
    <Layout>
      <Flex justifyContent='flex-end' mb={3}>
        <NetworkFilter
          onFilterChange={handleNetworkFilterChange}
          selectedNetwork={selectedNetwork}
        />
      </Flex>
      {isLoading && displayedTrees.length === 0 ? (
        <Flex justifyContent='center' alignItems='center' h='100vh'>
          <Text>Loading...</Text>
          <Spinner />
        </Flex>
      ) : (
        <InfiniteScroll
          dataLength={displayedTrees.length}
          next={handleNextPage}
          hasMore={hasMore}
          scrollableTarget='scrollableDiv'
          loader={
            <div className='loader' key={0}>
              Loading ...
            </div>
          }
        >
          <SimpleGrid
            justify='center'
            templateColumns='repeat(auto-fit, 250px)'
            gap={5}
            justifyContent='center'
          >
            {_.map(displayedTrees, (tree) => (
              <TreeCard key={tree.id} tree={tree} imagesData={imagesData} />
            ))}
          </SimpleGrid>
        </InfiniteScroll>
      )}
    </Layout>
  );
};

export default Home;

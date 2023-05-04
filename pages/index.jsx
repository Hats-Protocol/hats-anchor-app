import _ from 'lodash';
import { SimpleGrid, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
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
  const [displayedTrees, setDisplayedTrees] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSelectedNetwork(chainId);
  }, [chainId]);

  const handleNetworkFilterChange = (networkId) => {
    setSelectedNetwork(networkId);
    setPage(1);
  };

  const { trees } = usePaginatedTreeList({
    chainId: selectedNetwork,
    initialData: [],
    perPage: 20,
    page,
  });

  useEffect(() => {
    setDisplayedTrees(trees);
  }, [trees]);

  const tophats = _.map(displayedTrees, 'hats[0].id');
  const { data: imagesData } = useImageURIs(tophats, 1);

  const handleNextPage = () => {
    setPage(page + 1);
  };

  return (
    <Layout>
      <Flex justifyContent='flex-end' mb={3}>
        <NetworkFilter
          onFilterChange={handleNetworkFilterChange}
          selectedNetwork={selectedNetwork}
        />
      </Flex>
      <InfiniteScroll
        dataLength={displayedTrees.length}
        next={handleNextPage}
        hasMore
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
    </Layout>
  );
};

export default Home;

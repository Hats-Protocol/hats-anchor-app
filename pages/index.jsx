import _ from 'lodash';
import { SimpleGrid, Flex, Text, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import Layout from '../components/Layout';
import useTreeList from '../hooks/useTreeList';
import useImageURIs from '../hooks/useImageURIs';
import NetworkFilter from '../components/NetworkFilter';
import TreeCard from '../components/TreeCard';

const Home = () => {
  const chainId = useChainId();
  const [selectedNetwork, setSelectedNetwork] = useState(chainId || 5);

  useEffect(() => {
    setSelectedNetwork(chainId);
  }, [chainId]);

  const handleNetworkFilterChange = (networkId) => {
    setSelectedNetwork(networkId);
  };

  const { data: treeData, isLoading } = useTreeList({
    chainId: selectedNetwork,
    initialData: [],
  });

  const tophats = _.map(treeData, 'hats[0].id');
  const { data: imagesData, loading } = useImageURIs(tophats, 1);

  return (
    <Layout>
      <Flex justifyContent='flex-end' mb={3}>
        <NetworkFilter
          onFilterChange={handleNetworkFilterChange}
          selectedNetwork={selectedNetwork}
        />
      </Flex>
      {isLoading ? (
        <Flex justifyContent='center' alignItems='center' h='100vh'>
          <Text>Loading...</Text>
          <Spinner />
        </Flex>
      ) : (
        <SimpleGrid
          justify='center'
          templateColumns='repeat(auto-fit, 250px)'
          gap={5}
          justifyContent='center'
        >
          {_.map(treeData, (tree) => (
            <TreeCard tree={tree} imagesData={imagesData} />
          ))}
        </SimpleGrid>
      )}
    </Layout>
  );
};

export default Home;

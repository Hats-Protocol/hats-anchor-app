import _ from 'lodash';
import { SimpleGrid, Flex, Heading, Spinner, Button } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
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
  const [allCardsInView, setAllCardsInView] = useState(false);

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

  const gridRef = useRef();

  // // check if all cards are in view
  useEffect(() => {
    if (!gridRef.current) {
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setAllCardsInView(true);
      } else {
        setAllCardsInView(false);
      }
    }, observerOptions);

    observer.observe(gridRef.current);

    // Cleanup function to disconnect the observer
    // when the component unmounts or when the dependency changes
    // eslint-disable-next-line consistent-return
    return () => {
      observer.disconnect();
    };
  }, [gridRef]);

  return (
    <Layout>
      <Flex justifyContent='flex-end' mb={3}>
        <NetworkFilter
          onFilterChange={handleNetworkFilterChange}
          selectedNetwork={selectedNetwork}
        />
      </Flex>
      <div ref={gridRef}>
        {trees && (
          <InfiniteScroll
            dataLength={trees.length}
            next={() => setPage(page + 1)}
            hasMore
            scrollThreshold={1}
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
        )}
        {allCardsInView && (
          <Flex w='full' justifyContent='center' mt={4}>
            <Button onClick={() => setPage(page + 1)}>Load more</Button>
          </Flex>
        )}
      </div>
      {trees && trees.length === 0 && (
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

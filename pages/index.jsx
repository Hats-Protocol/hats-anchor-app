import _ from 'lodash';
import {
  CardBody,
  Heading,
  Link as ChakraLink,
  SimpleGrid,
  Card,
  Flex,
  Text,
  Stack,
  HStack,
  Badge,
  Box,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import Layout from '../components/Layout';
import useImageURIs from '../hooks/useImageURIs';
import NetworkFilter from '../components/NetworkFilter';
import TreeCard from '../components/TreeCard';
import { fetchPaginatedTrees } from '../gql/helpers';
import usePaginatedTreeList from '../hooks/usePaginatedTreeList';

const Home = ({ trees: initialData, defaultNetworkId }) => {
  const [selectedNetwork, setSelectedNetwork] = useState(defaultNetworkId);
  const [gridRef, setGridRef] = useState(null);

  const handleNetworkFilterChange = useCallback(
    (networkId) => {
      setSelectedNetwork(networkId);
    },
    [setSelectedNetwork],
  );

  const { trees, fetchNextPage, isEnd } = usePaginatedTreeList({
    chainId: selectedNetwork,
    initialData,
  });

  const topHatIds = useMemo(() => {
    return _.map(trees, 'hats[0].id');
  }, [trees]);

  const { data: imagesData } = useImageURIs(topHatIds, selectedNetwork);

  // Intersection observer to detect when the bottom of the grid is in view,
  // if not at the end, fetches the next page of data
  useEffect(() => {
    if (!gridRef) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isEnd) {
        fetchNextPage();
      }
    }, observerOptions);

    observer.observe(gridRef);

    // eslint-disable-next-line consistent-return
    return () => {
      observer.disconnect();
    };
  }, [gridRef, fetchNextPage, isEnd]);

  return (
    <Layout>
      <Flex justifyContent='flex-end' mb={3} alignItems='center' gap={2}>
        <NetworkFilter
          onFilterChange={handleNetworkFilterChange}
          selectedNetwork={selectedNetwork}
        />
      </Flex>
      {trees && (
        <div ref={setGridRef}>
          <InfiniteScroll
            dataLength={trees.length}
            next={fetchNextPage}
            hasMore={!isEnd}
          >
            <SimpleGrid
              justify='center'
              gap={5}
              justifyContent='center'
              minChildWidth='250px'
            >
              {_.map(trees, (tree) => (
                <TreeCard key={tree.id} tree={tree} imagesData={imagesData} />
              ))}
            </SimpleGrid>
          </InfiniteScroll>
        </div>
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

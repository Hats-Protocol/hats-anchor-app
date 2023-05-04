import _ from 'lodash';
import {
  CardBody,
  Link as ChakraLink,
  SimpleGrid,
  Card,
  Flex,
  Text,
  Stack,
  HStack,
  Badge,
  Box,
  Spinner,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import Layout from '../components/Layout';
import useTreeList from '../hooks/useTreeList';
import useImageURIs from '../hooks/useImageURIs';
import { decimalId } from '../lib/hats';
import NetworkFilter from '../components/NetworkFilter';

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
          {_.map(treeData, (tree) => {
            const topHat = _.get(tree, 'hats[0]');

            return (
              <ChakraLink
                as={Link}
                href={`/trees/${_.get(tree, 'chainId')}/${decimalId(
                  _.get(tree, 'id'),
                )}/${decimalId(_.get(tree, 'hats[0].prettyId'))}`}
                key={`${_.get(tree, 'chainId')}-${_.get(tree, 'id')}`}
              >
                <Card overflow='hidden'>
                  <CardBody>
                    <HStack
                      h='100px'
                      w='100%'
                      justify='left'
                      align='center'
                      spacing='16px'
                    >
                      <Box
                        bgImage={
                          imagesData[topHat.id]
                            ? `url('${imagesData[topHat.id]}')`
                            : `url('/icon.jpeg')`
                        }
                        bgSize='cover'
                        bgPosition='center'
                        alt='Top Hat image'
                        w='85px'
                        h='85px'
                        border='1px solid'
                        borderColor='gray.200'
                      />
                      <Stack spacing={1} maxW='110px'>
                        <Text fontWeight={700} noOfLines={2}>
                          {_.get(topHat, 'details')}
                        </Text>
                        <Text>Tree ID: {decimalId(_.get(tree, 'id'))}</Text>
                      </Stack>
                    </HStack>
                  </CardBody>
                </Card>
              </ChakraLink>
            );
          })}
        </SimpleGrid>
      )}
    </Layout>
  );
};

export default Home;

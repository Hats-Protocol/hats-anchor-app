import {
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { FaPlus } from 'react-icons/fa';
import { useAccount } from 'wagmi';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import Layout from '@/components/Layout';
import CONFIG from '@/constants';
import useImageURIs from '@/hooks/useImageURIs';
import useWearerDetails from '@/hooks/useWearerDetails';
import { orderedChains } from '@/lib/web3';

const FeaturedTreeCard = dynamic(() => import('@/components/FeaturedTreeCard'));
const HatCard = dynamic(() => import('@/components/HatCard'));

// todo use our ipfs gateway
const featuredTrees = [
  {
    chainId: 10,
    id: 2,
    name: 'Cabin DAO',
    description: 'A DAO for the Cabin community',
    image: `https://ipfs.io/ipfs/QmZMzmAKjeEWSbsQsRTKAUHD6u8BbMEdfLSXPviL6Br8na`,
  },
  {
    chainId: 100,
    id: 72,
    name: 'The DIA',
    description: 'A DAO for decentralized curation of intel',
    image: `https://indigo-selective-coral-505.mypinata.cloud/ipfs/bafybeie7nv4u6pd3ryv7goritnmkhvzwdxj2a2en7qaf5bbsntzec5jnea?pinataGatewayToken=M-iEBglWoUCZWJYsihe1IRrngs7HIGeIr3s5lObVw96hv7GTuCw1QrlmnNtwvuXt`,
  },
  {
    chainId: 10,
    id: 3,
    name: 'DemoDAO',
    description: 'An exquisite DAO for demo purposes',
    image: `https://ipfs.io/ipfs/QmWaiWKkRQtZQ5MuNHgYgwk48ubicyf7Ph8f6ZRUuUKmik`,
  },
];

const Home = () => {
  const { address: wearerAddress } = useAccount();

  const { data: currentHats, isLoading: detailsLoading } = useWearerDetails({
    wearerAddress,
  });

  const { data: currentHatsWithImagesData, isLoading: imagesLoading } =
    useImageURIs(currentHats);

  const sortedHats = _.sortBy(currentHatsWithImagesData, (hat) => {
    return _.indexOf(orderedChains, hat.chainId);
  });

  return (
    <Layout>
      <Box
        w='100%'
        h='100%'
        bg='blue'
        position='fixed'
        opacity={0.07}
        zIndex={-1}
      />
      <Flex py='150px' mx={20}>
        <Stack spacing={12}>
          <Stack spacing={4}>
            <Heading as='h1' size='md' fontWeight={500}>
              Featured Trees
            </Heading>
            <SimpleGrid columns={3} spacing={6} mx='auto'>
              {_.map(featuredTrees, (tree, i) => (
                <FeaturedTreeCard key={i} treeData={tree} />
              ))}
            </SimpleGrid>
          </Stack>
          {wearerAddress ? (
            <Stack spacing={4}>
              <Heading as='h1' size='md' fontWeight={500}>
                My Hats
              </Heading>
              {imagesLoading || detailsLoading ? (
                <Flex justify='center' align='center' pt={10}>
                  <Spinner />
                </Flex>
              ) : (
                <SimpleGrid columns={3} spacing={6}>
                  {/* New Tree Card first */}
                  <ChakraNextLink href='/trees/new'>
                    <Card h='100px' overflow='hidden'>
                      <CardBody p={4}>
                        <HStack>
                          <Flex
                            border='3px solid'
                            borderColor='gray.200'
                            borderRadius={4}
                            h='72px'
                            w='72px'
                            align='center'
                            justify='center'
                            bg='blue.400'
                          >
                            <Icon as={FaPlus} w={6} h={6} />
                          </Flex>
                          <Stack spacing={1}>
                            <Heading
                              as='h1'
                              size='md'
                              fontWeight={500}
                              noOfLines={1}
                            >
                              Create a new {CONFIG.tree}
                            </Heading>
                            <Text fontSize='sm'>
                              Set up a new Hats {CONFIG.tree}
                            </Text>
                          </Stack>
                        </HStack>
                      </CardBody>
                    </Card>
                  </ChakraNextLink>
                  {_.map(sortedHats, (hat, i) => (
                    <HatCard hat={hat} key={i} />
                  ))}
                </SimpleGrid>
              )}
            </Stack>
          ) : (
            <Flex>
              <Heading size='md' fontWeight={500}>
                Connect to see your hats
              </Heading>
            </Flex>
          )}
        </Stack>
      </Flex>
    </Layout>
  );
};

export default Home;

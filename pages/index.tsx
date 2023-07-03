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
import { FaPlus } from 'react-icons/fa';
import { useAccount } from 'wagmi';

// import CONFIG from '@/constants';
import ChakraNextLink from '@/components/ChakraNextLink';
import FeaturedTreeCard from '@/components/FeaturedTreeCard';
import HatCard from '@/components/HatCard';
import Layout from '@/components/Layout';
import CONFIG from '@/constants';
import useImageURIs from '@/hooks/useImageURIs';
import useWearerDetails from '@/hooks/useWearerDetails';

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
    chainId: 10,
    id: 2,
    name: 'Cabin DAO',
    description: 'A DAO for the Cabin community',
    image: `https://ipfs.io/ipfs/QmZMzmAKjeEWSbsQsRTKAUHD6u8BbMEdfLSXPviL6Br8na`,
  },
  {
    chainId: 10,
    id: 2,
    name: 'Cabin DAO',
    description: 'A DAO for the Cabin community',
    image: `https://ipfs.io/ipfs/QmZMzmAKjeEWSbsQsRTKAUHD6u8BbMEdfLSXPviL6Br8na`,
  },
];

const Home = () => {
  const { address: wearerAddress } = useAccount();

  const { data: currentHats, isLoading: detailsLoading } = useWearerDetails({
    wearerAddress,
  });

  const { data: currentHatsWithImagesData, isLoading: imagesLoading } =
    useImageURIs(currentHats);

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
            <SimpleGrid columns={3} spacing={6}>
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
                  {_.map(currentHatsWithImagesData, (hat, i) => (
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

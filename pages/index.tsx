import _ from 'lodash';
import {
  Heading,
  SimpleGrid,
  Flex,
  Box,
  Stack,
  Spinner,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';

import Layout from '@/components/Layout';
// import CONFIG from '@/constants';
import useWearerDetails from '@/hooks/useWearerDetails';
import useImageURIs from '@/hooks/useImageURIs';
import FeaturedTreeCard from '@/components/FeaturedTreeCard';
import HatCard from '@/components/HatCard';

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

  const { data: currentHats, isLoading } = useWearerDetails({
    wearerAddress,
  });

  const { data: currentHatsWithImagesData } = useImageURIs(currentHats);

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
              {isLoading ? (
                <Flex justify='center' align='center' pt={10}>
                  <Spinner />
                </Flex>
              ) : (
                <SimpleGrid columns={3} spacing={6}>
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

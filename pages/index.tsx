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

  const { data: mainnetWearer, isLoading: mainnetLoading } = useWearerDetails({
    wearerAddress,
    chainId: 1,
  });
  const { data: goerliWearer, isLoading: goerliLoading } = useWearerDetails({
    wearerAddress,
    chainId: 5,
  });
  const { data: optimismWearer, isLoading: optimismLoading } = useWearerDetails(
    {
      wearerAddress,
      chainId: 10,
    },
  );
  const { data: gnosisWearer, isLoading: gnosisLoading } = useWearerDetails({
    wearerAddress,
    chainId: 100,
  });
  const { data: polygonWearer, isLoading: polygonLoading } = useWearerDetails({
    wearerAddress,
    chainId: 137,
  });
  const { data: arbitrumWearer, isLoading: arbitrumLoading } = useWearerDetails(
    {
      wearerAddress,
      chainId: 42161,
    },
  );

  const mainnetHats = _.get(mainnetWearer, 'currentHats', []);
  const goerliHats = _.get(goerliWearer, 'currentHats', []);
  const optimismHats = _.get(optimismWearer, 'currentHats', []);
  const gnosisHats = _.get(gnosisWearer, 'currentHats', []);
  const polygonHats = _.get(polygonWearer, 'currentHats', []);
  const arbitrumHats = _.get(arbitrumWearer, 'currentHats', []);

  const currentHats = _.concat(
    mainnetHats,
    arbitrumHats,
    optimismHats,
    gnosisHats,
    polygonHats,
    goerliHats,
    // sepoliaHats,
  );

  const { data: mainnetImagesData } = useImageURIs(_.map(mainnetHats, 'id'), 1);
  const { data: goerliImagesData } = useImageURIs(_.map(goerliHats, 'id'), 5);
  const { data: optimismImagesData } = useImageURIs(
    _.map(optimismHats, 'id'),
    10,
  );
  const { data: gnosisImagesData } = useImageURIs(_.map(gnosisHats, 'id'), 100);
  const { data: polygonImagesData } = useImageURIs(
    _.map(polygonHats, 'id'),
    137,
  );
  const { data: arbitrumImagesData } = useImageURIs(
    _.map(arbitrumHats, 'id'),
    42161,
  );

  const imagesPerChain: { [key: number]: any } = {
    1: mainnetImagesData,
    5: goerliImagesData,
    10: optimismImagesData,
    100: gnosisImagesData,
    137: polygonImagesData,
    42161: arbitrumImagesData,
    // 11155111: sepoliaImagesData,
  };

  const loadingWearerHats = _.some([
    mainnetLoading,
    goerliLoading,
    optimismLoading,
    gnosisLoading,
    polygonLoading,
    arbitrumLoading,
  ]);

  console.log(currentHats);

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
          <Stack spacing={4}>
            <Heading as='h1' size='md' fontWeight={500}>
              My Hats
            </Heading>
            {loadingWearerHats ? (
              <Flex justify='center' align='center' pt={10}>
                <Spinner />
              </Flex>
            ) : (
              <SimpleGrid columns={3} spacing={6}>
                {_.map(currentHats, (hat, i) => (
                  <HatCard hat={hat} imagesPerChain={imagesPerChain} key={i} />
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Stack>
      </Flex>
    </Layout>
  );
};

export default Home;

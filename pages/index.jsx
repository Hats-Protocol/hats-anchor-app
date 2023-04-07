import _ from 'lodash';
import {
  CardBody,
  Heading,
  Link as ChakraLink,
  SimpleGrid,
  Card,
  Flex,
  Text,
  Image,
  Stack,
  HStack,
  Badge,
  Box,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../components/Layout';
import useTreeList from '../hooks/useTreeList';
import useImageURIs from '../hooks/useImageURIs';
import { fetchAllTrees } from '../gql/helpers';
// import { mapWithChainId } from '../lib/general';
import { decimalId } from '../lib/hats';
import { chainsMap, chainsColors } from '../lib/web3';

const Home = ({
  initialMainnetData,
  initialGoerliData,
  initialOptimismData,
  initialGnosisData,
  initialPolygonData,
  initialArbitrumData,
}) => {
  const { data: mainnetTrees } = useTreeList({
    chainId: 1,
    initialData: initialMainnetData,
  });
  const { data: goerliTrees } = useTreeList({
    chainId: 5,
    initialData: initialGoerliData,
  });
  const { data: optimismTrees } = useTreeList({
    chainId: 10,
    initialData: initialOptimismData,
  });
  const { data: gnosisTrees } = useTreeList({
    chainId: 100,
    initialData: initialGnosisData,
  });
  const { data: polygonTrees } = useTreeList({
    chainId: 137,
    initialData: initialPolygonData,
  });
  const { data: arbitrumTrees } = useTreeList({
    chainId: 42161,
    initialData: initialArbitrumData,
  });
  // const { data: sepoliaTrees } = useTreeList({
  //   chainId: 11155111,
  //   initialData: initialPolygonData,
  // });
  const allTrees = _.concat(
    mainnetTrees,
    polygonTrees,
    gnosisTrees,
    goerliTrees,
    optimismTrees,
    arbitrumTrees,
    // sepoliaTrees,
  );

  // get top hats of every chain
  const mainnetTopHats = _.map(mainnetTrees, 'hats[0].id');
  const goerliTopHats = _.map(goerliTrees, 'hats[0].id');
  const optimismTopHats = _.map(optimismTrees, 'hats[0].id');
  const gnosisTopHats = _.map(gnosisTrees, 'hats[0].id');
  const polygonTopHats = _.map(polygonTrees, 'hats[0].id');
  const arbitrumTopHats = _.map(arbitrumTrees, 'hats[0].id');
  // const sepoliaTopHats = _.map(arbitrumTrees, 'hats[0].id');

  // get images per hat for every chain
  const { data: mainnetImagesData, loading: mainnetImagesLoading } =
    useImageURIs(mainnetTopHats, 1);
  const { data: goerliImagesData, loading: goerliImagesLoading } = useImageURIs(
    goerliTopHats,
    5,
  );
  const { data: optimismImagesData, loading: optimismImagesLoading } =
    useImageURIs(optimismTopHats, 10);
  const { data: gnosisImagesData, loading: gnosisImagesLoading } = useImageURIs(
    gnosisTopHats,
    100,
  );
  const { data: polygonImagesData, loading: polygonImagesLoading } =
    useImageURIs(polygonTopHats, 137);
  const { data: arbitrumImagesData, loading: arbitrumImagesLoading } =
    useImageURIs(arbitrumTopHats, 42161);
  // const { data: sepoliaImagesData, loading: sepoliaImagesLoading } =
  //   useImageURIs(sepoliaTopHats, 11155111);

  const imagesPerChain = {
    1: mainnetImagesData,
    5: goerliImagesData,
    10: optimismImagesData,
    100: gnosisImagesData,
    137: polygonImagesData,
    42161: arbitrumImagesData,
    // 11155111: sepoliaImagesData,
  };

  return (
    <Layout>
      <Flex justify='center' mb={10}>
        <Heading>Welcome to Hats</Heading>
      </Flex>

      <SimpleGrid
        justify='center'
        templateColumns='repeat(auto-fit, 250px)'
        gap={5}
        justifyContent='center'
      >
        {_.map(allTrees, (tree) => {
          const topHat = _.get(tree, 'hats[0]');
          const currentChainId = _.get(tree, 'chainId');
          const chainColorScheme = chainsColors(currentChainId);

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
                    <Image
                      src={
                        imagesPerChain[tree.chainId][topHat.id] || '/icon.jpeg'
                      }
                      alt='Top Hat image'
                      maxW='84px'
                      border='1px solid'
                      borderColor='gray.200'
                    />
                    <Stack spacing={1}>
                      <Text fontWeight={700} noOfLines={2}>
                        {_.get(topHat, 'details')}
                      </Text>
                      <Text>Tree ID: {decimalId(_.get(tree, 'id'))}</Text>
                      <Box>
                        <Badge colorScheme={chainColorScheme}>
                          {chainsMap(_.get(tree, 'chainId'))?.name}
                        </Badge>
                      </Box>
                    </Stack>
                  </HStack>
                </CardBody>
              </Card>
            </ChakraLink>
          );
        })}
      </SimpleGrid>
    </Layout>
  );
};

export const getServerSideProps = async () => {
  const mainnetTrees = await fetchAllTrees(1);
  const goerliTrees = await fetchAllTrees(5);
  const optimismTrees = await fetchAllTrees(10);
  const gnosisTrees = await fetchAllTrees(100);
  const polygonTrees = await fetchAllTrees(137);
  const arbitrumTrees = await fetchAllTrees(42161);
  // const sepoliaTrees = await fetchAllTrees(11155111);

  return {
    props: {
      initialMainnetData: mainnetTrees || null,
      initialGoerliData: goerliTrees || null,
      initialOptimismData: optimismTrees || null,
      initialGnosisData: gnosisTrees || null,
      initialPolygonData: polygonTrees || null,
      initialArbitrumData: arbitrumTrees || null,
      // initialSepoliaData: sepoliaTrees || null,
    },
  };
};

export default Home;

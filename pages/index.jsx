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
import { fetchAllTrees } from '../gql/helpers';
// import { mapWithChainId } from '../lib/general';
import { decimalId } from '../lib/hats';
import { chainsMap, chainsColors } from '../lib/web3';

const Home = ({ initialGoerliData, initialGnosisData, initialPolygonData }) => {
  const { data: goerliTrees } = useTreeList({
    chainId: 5,
    initialData: initialGoerliData,
  });
  const { data: gnosisTrees } = useTreeList({
    chainId: 100,
    initialData: initialGnosisData,
  });
  const { data: polygonTrees } = useTreeList({
    chainId: 137,
    initialData: initialPolygonData,
  });
  const allTrees = _.concat(polygonTrees, gnosisTrees, goerliTrees);

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
          const chainColorScheme = chainsColors(_.get(tree, 'chainId'));

          return (
            <ChakraLink
              as={Link}
              href={`/trees/${_.get(tree, 'chainId')}/${decimalId(
                _.get(tree, 'id'),
              )}/${decimalId(_.get(tree, 'hats[0].prettyId'))}`}
              key={`${_.get(tree, 'chainId')}-${_.get(tree, 'id')}`}
            >
              <Card>
                <CardBody>
                  <HStack
                    h='100px'
                    w='100%'
                    justify='left'
                    align='center'
                    spacing='16px'
                  >
                    <Image
                      src='/icon.jpeg'
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
  const goerliTrees = await fetchAllTrees(5);
  const gnosisTrees = await fetchAllTrees(100);
  const polygonTrees = await fetchAllTrees(137);

  return {
    props: {
      initialGoerliData: goerliTrees || null,
      initialGnosisData: gnosisTrees || null,
      initialPolygonData: polygonTrees || null,
    },
  };
};

export default Home;

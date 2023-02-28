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
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../components/Layout';
import useTreeList from '../hooks/useTreeList';
import { fetchAllTrees } from '../gql/helpers';
import { decimalId } from '../lib/hats';

const Home = ({ chainId, initialData }) => {
  const { data: trees } = useTreeList({ chainId, initialData });

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
        {_.map(trees, (tree) => (
          <ChakraLink
            as={Link}
            href={`/trees/${chainId}/${decimalId(
              _.get(tree, 'id'),
            )}/${decimalId(_.get(tree, 'hats[0].prettyId'))}`}
            key={_.get(tree, 'id')}
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
                  <Stack>
                    <Text as='b'>Tree Name</Text>
                    <Text>Tree ID: {decimalId(_.get(tree, 'id'))}</Text>
                  </Stack>
                </HStack>
              </CardBody>
            </Card>
          </ChakraLink>
        ))}
      </SimpleGrid>
    </Layout>
  );
};

// TODO handle multiple chains
const defaultChainId = 5;
export const getStaticProps = async () => {
  const initialData = await fetchAllTrees(defaultChainId);

  return {
    props: {
      initialData,
      chainId: defaultChainId,
    },
  };
};

export default Home;

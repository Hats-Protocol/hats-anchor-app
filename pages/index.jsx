import _ from 'lodash';
import {
  CardBody,
  Heading,
  Link as ChakraLink,
  SimpleGrid,
  Card,
  Flex,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../components/Layout';
import useTreeList from '../hooks/useTreeList';
import { fetchAllTrees } from '../gql/helpers';

const Home = ({ chainId, initialData }) => {
  const { data: trees } = useTreeList({ chainId, initialData });
  console.log(trees);

  return (
    <Layout>
      <Flex justify='center' my={6}>
        <Heading>Welcome to Hats</Heading>
      </Flex>

      <SimpleGrid columns={6} gap={4}>
        {_.map(trees, (tree) => (
          <ChakraLink
            as={Link}
            href={`/trees/${_.get(tree, 'id')}`}
            key={_.get(tree, 'id')}
          >
            <Card>
              <CardBody>
                <Flex h='100px' w='100%' justify='center' align='center'>
                  <Text>{_.get(tree, 'id')}</Text>
                </Flex>
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

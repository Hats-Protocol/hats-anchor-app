import _ from 'lodash';
import { Heading, Link as ChakraLink, Stack } from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../components/Layout';

const hatsAddresses = {
  // 1: '0x95647f88dcbc12986046fc4f49064edd11a25d38',
  5: '0xB7019C3670F5d4dD99166727a7D29F8A16F4F20A',
  137: '0x95647f88dcbc12986046fc4f49064edd11a25d38',
};

const Home = () => (
  <Layout>
    <Heading>Welcome to hats</Heading>

    <Stack>
      {_.map(_.keys(hatsAddresses), (chainId) => (
        <ChakraLink
          as={Link}
          href={`/hats/${hatsAddresses[chainId]}`}
          key={hatsAddresses[chainId]}
        >
          {hatsAddresses[chainId]}
        </ChakraLink>
      ))}
    </Stack>
  </Layout>
);

export default Home;

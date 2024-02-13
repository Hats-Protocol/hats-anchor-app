import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useIsClient } from 'app-hooks';
import { formatAddress } from 'app-utils';
import {
  ChakraNextLink,
  StandaloneLayout as Layout,
  // WearerHatCard as CoreHat,
} from 'ui';
import { useAccount, useEnsName } from 'wagmi';

const LookingForHat = () => (
  <Stack>
    <Text>
      This app is here to help you claim hats based on their eligibility
      module(s).
    </Text>
    <Text>
      You&apos;re probably looking for a specific hat. Look out for a link here
      with a specific hat ID on it:{' '}
      <ChakraNextLink href='/1/22.1.2' decoration>
        <Text variant='mono' display='inline-block'>
          /1/22.1.2
        </Text>
      </ChakraNextLink>
    </Text>
  </Stack>
);

const Home = () => {
  const isClient = useIsClient();
  const { address: wearerAddress } = useAccount();
  const { data: ensName } = useEnsName({
    address: wearerAddress,
    chainId: 1,
    enabled: !!wearerAddress && isClient,
  });

  if (!isClient || !wearerAddress) {
    return (
      <Layout title='Claims'>
        <Box
          w='100%'
          h='100%'
          bg='blue'
          position='fixed'
          opacity={0.07}
          zIndex={-1}
        />
        <Flex px={20} py={120}>
          <Stack spacing={10}>
            <Heading variant='medium'>
              Welcome to the Hats Protocol Claims app! 🧢
            </Heading>
            <LookingForHat />
          </Stack>
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout title='Claims'>
      <Box
        w='100%'
        h='100%'
        bg='blue'
        position='fixed'
        opacity={0.07}
        zIndex={-1}
      />
      <Flex px={20} py={120}>
        <Stack spacing={50}>
          <Heading variant='medium'>
            gm {ensName || formatAddress(wearerAddress)}, welcome to the claims
            app
          </Heading>
          <LookingForHat />
        </Stack>
      </Flex>
    </Layout>
  );
};

export default Home;

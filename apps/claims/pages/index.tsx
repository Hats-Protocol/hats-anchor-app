import { Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useIsClient, useRudderStackAnalytics } from 'hooks';
import { useEffect } from 'react';
import { ChakraNextLink, StandaloneLayout as Layout } from 'ui';
import { formatAddress } from 'utils';
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
      <ChakraNextLink
        href='/1/22.1.2'
        decoration
        fontFamily='monospace'
        display='inline-block'
      >
        /1/22.1.2
      </ChakraNextLink>
    </Text>
  </Stack>
);

const Home = () => {
  const isClient = useIsClient();
  const analytics = useRudderStackAnalytics();
  const { address: wearerAddress } = useAccount();
  const { data: ensName } = useEnsName({
    address: wearerAddress,
    chainId: 1,
    enabled: !!wearerAddress && isClient,
  });

  useEffect(() => {
    if (analytics) {
      analytics.page('Auto Track', 'Landing Page', {
        isConnected: !!wearerAddress,
        anonymousId: wearerAddress || analytics.getAnonymousId(),
      });
    }
  }, [analytics, wearerAddress]);

  if (!isClient || !wearerAddress) {
    return (
      <Layout title='Claims'>
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

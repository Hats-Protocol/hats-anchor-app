'use client';

import { Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useMediaStyles } from 'hooks';
import { StandaloneLayout as Layout } from 'molecules';
import { ChakraNextLink } from 'ui';
import { formatAddress } from 'utils';
import { useAccount, useEnsName } from 'wagmi';

const LookingForHat = () => (
  <Stack>
    <Text>
      This app is here to help you claim hats based on their eligibility
      module(s).
    </Text>
    <Text maxW='60%'>
      You&apos;re probably looking for a specific hat. Look out for a link here
      with a specific hat ID on it, like the Hats Protocol Community Hat:{' '}
      <ChakraNextLink
        href='/10/1.2.1.1'
        decoration
        fontFamily='monospace'
        display='inline-block'
      >
        /10/1.2.1.1
      </ChakraNextLink>
    </Text>
  </Stack>
);

const Home = () => {
  const { isClient } = useMediaStyles();

  const { address: wearerAddress } = useAccount();
  const { data: ensName } = useEnsName({
    address: wearerAddress,
    chainId: 1,
  });

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

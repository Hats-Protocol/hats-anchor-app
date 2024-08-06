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
      This app is here to help you get a quick glimpse at the current treasury &
      budgets across your organization&apos;s roles.
    </Text>
    <Text maxW='60%'>
      You&apos;re probably looking for a specific tree. Look out for a link here
      with a specific tree ID on it, like Raid Guild:{' '}
      <ChakraNextLink
        href='/100/92'
        decoration
        fontFamily='monospace'
        display='inline-block'
      >
        /100/92
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
              Welcome to the Hats Protocol treasury app! 🧢
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
            gm {ensName || formatAddress(wearerAddress)}, welcome to the
            treasury app
          </Heading>
          <LookingForHat />
        </Stack>
      </Flex>
    </Layout>
  );
};

export default Home;

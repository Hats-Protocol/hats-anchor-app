'use client';

import { Flex, HStack, Image, Text } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

import Login from './login';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

export const Navbar = () => {
  return (
    <Flex
      w='100%'
      justify='space-between'
      align='center'
      zIndex={10}
      px={2}
      minH='56px'
    >
      <HStack spacing={4}>
        <ChakraNextLink href='/'>
          <Image src='/hats.png' boxSize={10} alt='Hats Logo' />
        </ChakraNextLink>

        <Text size='lg' fontWeight='bold'>
          Join Group A Council
        </Text>
      </HStack>

      <Login />
    </Flex>
  );
};

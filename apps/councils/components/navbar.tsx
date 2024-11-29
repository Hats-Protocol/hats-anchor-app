'use client';

import { Flex, Heading, HStack, Image } from '@chakra-ui/react';
import { ChakraNextLink } from 'ui';

import Login from './login';

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
      <HStack>
        <ChakraNextLink href='/'>
          <Image src='/hats.png' boxSize={10} alt='Hats Logo' />
        </ChakraNextLink>
      </HStack>

      <Login />
    </Flex>
  );
};

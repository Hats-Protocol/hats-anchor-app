'use client';

import { Flex, Heading, HStack, Image } from '@chakra-ui/react';
import { ConnectWallet } from 'molecules';
import dynamic from 'next/dynamic';
import { AppHat } from 'types';

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
      position='fixed'
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

import React from 'react';
import { Flex, Image, HStack, Link as ChakraLink } from '@chakra-ui/react';
import Link from 'next/link';
import ConnectWallet from './ConnectWallet';
import CONFIG from '../constants';
import SearchBar from './SearchBar';

const navigation = [
  { name: 'Create Tree', href: '/create/tree' },
  { name: 'Example', href: '/example' },
];

// TODO add drawer

const Navbar = () => (
  <Flex w='100%' justify='space-between' align='center' px={8}>
    <HStack spacing={6}>
      <ChakraLink as={Link} href='/'>
        <Image src={CONFIG.logoUrl} alt={CONFIG.appName} height='75px' />
      </ChakraLink>
      <HStack spacing={3}>
        {navigation.map((item) => (
          <ChakraLink as={Link} href={item.href} key={item.name}>
            {item.name}
          </ChakraLink>
        ))}
      </HStack>
    </HStack>

    <SearchBar />

    <ConnectWallet />
  </Flex>
);

export default Navbar;

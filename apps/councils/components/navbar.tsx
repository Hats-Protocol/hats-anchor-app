'use client';

import { Flex, HStack, Image, Text } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { ChakraNextLink } from 'ui';

import Login from './login';

export const Navbar = () => {
  const pathname = usePathname();
  const isJoinLink = pathname.includes('join');

  return (
    <Flex w='100%' justify='space-between' align='center' zIndex={10} px={2} minH='56px'>
      <HStack spacing={4}>
        <ChakraNextLink href='/'>
          <Image src='/hats.png' boxSize={10} alt='Hats Logo' />
        </ChakraNextLink>

        {isJoinLink ? (
          <Text size='lg' fontWeight='bold'>
            Join Group A Council
          </Text>
        ) : null}
      </HStack>

      <Login />
    </Flex>
  );
};

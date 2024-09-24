'use client';

import { Flex, Heading, HStack, Image } from '@chakra-ui/react';
import { AppHat } from 'types';
import { ChakraNextLink } from 'ui';

import ConnectWallet from '../ConnectWallet';

const StandaloneNavbar = ({ heading, hatData }: StandaloneNavbarProps) => {
  return (
    <Flex
      w='100%'
      justify='space-between'
      align='center'
      position='fixed'
      zIndex={10}
      px={2}
      minH='56px'
      bg={hatData ? 'whiteAlpha.900' : 'transparent'}
    >
      <HStack>
        <ChakraNextLink href='/'>
          <Image src='/hats.png' h='40px' w='40px' alt='Hats Logo' />
        </ChakraNextLink>
        {heading && (
          <Heading size='lg' variant='medium'>
            {heading}
          </Heading>
        )}
      </HStack>

      <ConnectWallet hideProfileButton />
    </Flex>
  );
};

export default StandaloneNavbar;

interface StandaloneNavbarProps {
  heading?: string;
  hatData?: AppHat;
}

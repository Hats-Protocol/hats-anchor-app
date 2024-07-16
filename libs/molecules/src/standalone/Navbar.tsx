'use client';

import { Flex, Image } from '@chakra-ui/react';
import { AppHat } from 'types';
import { ChakraNextLink } from 'ui';

import ConnectWallet from '../ConnectWallet';

const StandaloneNavbar = ({ hatData }: StandaloneNavbarProps) => {
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
      <ChakraNextLink href='/'>
        <Image src='/hats.png' h='40px' w='40px' alt='Hats Logo' />
      </ChakraNextLink>

      <ConnectWallet />
    </Flex>
  );
};

export default StandaloneNavbar;

interface StandaloneNavbarProps {
  hatData?: AppHat;
}

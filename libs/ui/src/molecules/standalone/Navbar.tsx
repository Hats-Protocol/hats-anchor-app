import { Flex, HStack, Image } from '@chakra-ui/react';

import { ChakraNextLink } from '../../atoms';
import ConnectWallet from '../ConnectWallet';

const Navbar = () => {
  return (
    <Flex
      w='100%'
      justify='space-between'
      align='center'
      px={8}
      bg='white'
      borderBottom='1px solid'
      borderColor='gray.400'
      boxShadow='md'
      position='fixed'
      zIndex={10}
      minH='75px'
    >
      <HStack spacing={6}>
        <ChakraNextLink href='/'>
          <Image src='/icon.jpeg' h='70px' w='70px' alt='Hats Logo' />
        </ChakraNextLink>
      </HStack>

      <HStack spacing={2}>
        <ConnectWallet />
      </HStack>
    </Flex>
  );
};

export default Navbar;

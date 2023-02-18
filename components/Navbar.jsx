import React from 'react';
import {
  Flex,
  Image,
  HStack,
  Link as ChakraLink,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import ConnectWallet from './ConnectWallet';
import CONFIG from '../constants';
import { useOverlay } from '../contexts/OverlayContext';

const navigation = [{ name: 'Create Tree', href: '/create/tree' }];

// TODO add drawer

const Navbar = () => {
  const { setCommandPallet: setOpen } = useOverlay();

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
    >
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

      <HStack stack={6}>
        <IconButton
          icon={<Icon as={FaSearch} />}
          onClick={() => setOpen(true)}
        />
        <ConnectWallet />
      </HStack>
    </Flex>
  );
};

export default Navbar;

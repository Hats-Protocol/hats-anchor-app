import React, { useMemo } from 'react';
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
import { useAccount } from 'wagmi';

import ConnectWallet from './ConnectWallet';
import CONFIG from '../constants';
import { useOverlay } from '../contexts/OverlayContext';
import { clearNonObjects } from '../lib/general';

// TODO add drawer

const Navbar = () => {
  const { setCommandPallet: setOpen } = useOverlay();
  const { address } = useAccount();

  const navLinks = useMemo(() => {
    const links = [
      { name: 'Create Tree', href: '/trees/create' },
      address && { name: 'User Hats', href: `/wearers/${address}` },
    ];

    return clearNonObjects(links);
  }, [address]);

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
        <ChakraLink as={Link} href='/'>
          <Image src='/icon.jpeg' h='70px' alt='Hats Logo' />
          {/* <Heading>{CONFIG.emojis}</Heading> */}
        </ChakraLink>
        <HStack spacing={3}>
          {navLinks.map((item) => (
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

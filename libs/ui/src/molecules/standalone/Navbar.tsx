import {
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  useDisclosure,
} from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import { useAccount } from 'wagmi';

import {
  ChakraNextLink,
  StandaloneMobileDrawer as MobileDrawer,
} from '../../atoms';
import ConnectWallet from '../ConnectWallet';

const Navbar = ({ title }: { title?: string }) => {
  const { isOpen, onToggle } = useDisclosure();
  const { address } = useAccount();

  return (
    <Flex
      w='100%'
      justify='space-between'
      align='center'
      px={{ base: 2, md: 8 }}
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
          {title ? (
            <HStack>
              <Image src='/icon.jpeg' h='70px' w='70px' alt='Hats Logo' />
              <Heading size='2xl' variant='medium'>
                {title}
              </Heading>
            </HStack>
          ) : (
            <Image src='/icon.jpeg' h='70px' w='70px' alt='Hats Logo' />
          )}
        </ChakraNextLink>
      </HStack>

      <Flex display={{ base: 'none', md: 'flex' }}>
        <ConnectWallet />
      </Flex>
      <Flex display={{ base: 'flex', md: 'none' }}>
        <IconButton
          bg={address ? 'green.200' : 'gray.200'}
          icon={<Icon as={FiMenu} />}
          aria-label='mobile menu'
          onClick={onToggle}
        />
      </Flex>

      <MobileDrawer isOpen={isOpen} onToggle={onToggle} />
    </Flex>
  );
};

export default Navbar;

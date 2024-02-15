import { Button, Flex, HStack, Image, Text } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { AppHat } from 'hats-types';
import _ from 'lodash';
import { BsDiagram3Fill } from 'react-icons/bs';
import { useChainId } from 'wagmi';

import { ChakraNextLink } from '../atoms';
import ConnectWallet from './ConnectWallet';

const NavbarMobile = ({ hatData }: { hatData?: AppHat }) => {
  const currentChainId = useChainId();

  return (
    <Flex
      w='100%'
      justify='space-between'
      align='center'
      boxShadow='md'
      position='fixed'
      zIndex={10}
      px={2}
      minH='56px'
    >
      <HStack spacing={2}>
        <ChakraNextLink href='/'>
          <Image src='/hats.png' h='40px' w='40px' alt='Hats Logo' />
        </ChakraNextLink>
        <ChakraNextLink
          href={`/${CONFIG.trees}/${hatData?.chainId || currentChainId || 1}`}
        >
          <Button leftIcon={<BsDiagram3Fill />}>
            <Text size='lg'>{_.capitalize(CONFIG.trees)}</Text>
          </Button>
        </ChakraNextLink>
      </HStack>

      <ConnectWallet />
    </Flex>
  );
};

export default NavbarMobile;

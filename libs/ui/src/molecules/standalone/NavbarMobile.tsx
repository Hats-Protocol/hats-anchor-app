import {
  Button,
  Flex,
  HStack,
  Image,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { AppHat } from 'hats-types';
import _ from 'lodash';
import { BsArrowLeft, BsDiagram3Fill } from 'react-icons/bs';
import { useChainId } from 'wagmi';

import { ChakraNextLink } from '../../atoms';
import MobileDrawer from '../../atoms/standalone/MobileDrawer';
import ConnectWallet from '../ConnectWallet';

const NavbarMobile = ({ hatData }: { hatData?: AppHat }) => {
  const currentChainId = useChainId();
  const { chainId } = useTreeForm();
  const { isOpen, onToggle } = useDisclosure();
  const treeId = hatIdToTreeId(BigInt(hatData?.id || 0));

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
      <HStack spacing={2}>
        <ChakraNextLink href='/'>
          <Image src='/hats.png' h='40px' w='40px' alt='Hats Logo' />
        </ChakraNextLink>
        {hatData ? (
          <ChakraNextLink
            href={`/${CONFIG.trees}/${
              hatData?.chainId || chainId || currentChainId || 1
            }/${treeId}`}
          >
            <Button leftIcon={<BsArrowLeft />}>
              <Text size='lg'>{treeId}</Text>
            </Button>
          </ChakraNextLink>
        ) : (
          <ChakraNextLink
            href={`/${CONFIG.trees}/${chainId || currentChainId || 1}`}
          >
            <Button leftIcon={<BsDiagram3Fill />}>
              <Text size='lg'>{_.capitalize(CONFIG.trees)}</Text>
            </Button>
          </ChakraNextLink>
        )}
      </HStack>

      <ConnectWallet />

      <MobileDrawer isOpen={isOpen} onToggle={onToggle} />
    </Flex>
  );
};

export default NavbarMobile;

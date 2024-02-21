import { Button, Flex, HStack, Image, Text } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { AppHat } from 'hats-types';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { BsArrowLeft, BsDiagram3Fill } from 'react-icons/bs';
import { useChainId } from 'wagmi';

import { ChakraNextLink } from '../../atoms';
import ConnectWallet from '../ConnectWallet';

const NavbarMobile = ({ hatData }: { hatData?: AppHat }) => {
  const currentChainId = useChainId();
  const { chainId } = useTreeForm();
  const treeId = hatIdToTreeId(BigInt(hatData?.id || 0));
  const router = useRouter();
  const pathSegments = _.split(router.pathname, '/').filter(Boolean);
  const isTreesRoute = pathSegments.length === 2 && pathSegments[0] === 'trees';

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
          !isTreesRoute && (
            <ChakraNextLink
              href={`/${CONFIG.trees}/${chainId || currentChainId || 1}`}
            >
              <Button leftIcon={<BsDiagram3Fill />}>
                <Text size='lg'>{_.capitalize(CONFIG.trees)}</Text>
              </Button>
            </ChakraNextLink>
          )
        )}
      </HStack>

      <ConnectWallet />
    </Flex>
  );
};

export default NavbarMobile;

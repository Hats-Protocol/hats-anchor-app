'use client';

import { Button, Flex, HStack, Image, Text } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import _ from 'lodash';
// import { usePathname } from 'next/navigation';
import { BsArrowLeft, BsDiagram3Fill } from 'react-icons/bs';
import { AppHat } from 'types';
import { useChainId } from 'wagmi';

import { ChakraNextLink } from '../../atoms';
import ConnectWallet from '../ConnectWallet';

const StandaloneNavbar = ({
  hatData,
  showLink = true,
}: StandaloneNavbarProps) => {
  const currentChainId = useChainId();
  const { chainId } = useTreeForm();
  const treeId = hatIdToTreeId(BigInt(hatData?.id || 0));
  // const pathname = usePathname();
  // const pathSegments = _.split(router.pathname, '/').filter(Boolean);
  const isTreesRoute = true; // pathSegments.length === 2 && pathSegments[0] === 'trees';
  const topHatName = _.get(
    hatData,
    'detailsObject.data.name',
    hatData?.details,
  );

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
        {showLink &&
          (hatData ? (
            <ChakraNextLink
              href={`/${CONFIG.trees}/${
                hatData?.chainId || chainId || currentChainId || 1
              }/${treeId}`}
            >
              <Button
                leftIcon={<BsArrowLeft />}
                variant='whiteFilled'
                maxW='175px'
              >
                <Text isTruncated>{topHatName}</Text>
              </Button>
            </ChakraNextLink>
          ) : (
            !isTreesRoute && (
              <ChakraNextLink
                href={`/${CONFIG.trees}/${chainId || currentChainId || 1}`}
              >
                <Button leftIcon={<BsDiagram3Fill />} variant='whiteFilled'>
                  <Text size='lg'>{_.capitalize(CONFIG.trees)}</Text>
                </Button>
              </ChakraNextLink>
            )
          ))}
      </HStack>

      <ConnectWallet />
    </Flex>
  );
};

export default StandaloneNavbar;

interface StandaloneNavbarProps {
  hatData?: AppHat;
  showLink?: boolean;
}

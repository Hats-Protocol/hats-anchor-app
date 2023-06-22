import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import {
  Flex,
  Image,
  HStack,
  Icon,
  IconButton,
  Button,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FaSearch } from 'react-icons/fa';
import { useAccount } from 'wagmi';

import ChakraNextLink from '@/components/ChakraNextLink';
import ConnectWallet from '@/components/ConnectWallet';
import { useOverlay } from '@/contexts/OverlayContext';
import CONFIG from '@/constants';
import { fetchHatDetails } from '@/gql/helpers';
import { fetchDetailsIpfs } from '@/hooks/useHatDetailsField';
import { urlIdToPrettyId, prettyIdToId } from '@/lib/hats';

const Navbar = () => {
  const localOverlay = useOverlay();
  const { setCommandPallet: setOpen } = localOverlay;
  const router = useRouter();
  const path = router.asPath.split('/').slice(1);
  const { address } = useAccount();
  const [currentTopHatName, setCurrentTopHatName] = useState<any>(null);

  useEffect(() => {
    const getTopHatDetails = async () => {
      const chainId = path[1];
      const topHatId = urlIdToPrettyId(path[3]?.split('_').slice(0, 1)[0]);

      if (!topHatId) {
        return;
      }
      const topHat = await fetchHatDetails(
        prettyIdToId(topHatId),
        Number(chainId),
      );
      if (topHat && topHat.details.startsWith('ipfs://')) {
        const details = await fetchDetailsIpfs(_.get(topHat, 'details'));
        const name = _.get(details, 'name');
        setCurrentTopHatName(name);
      } else {
        setCurrentTopHatName(_.get(topHat, 'details'));
      }
    };

    if (!currentTopHatName && path) {
      getTopHatDetails();
    }
  }, [path, currentTopHatName]);

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
          <Image src='/icon.jpeg' h='70px' alt='Hats Logo' />
        </ChakraNextLink>
        <HStack spacing={5}>
          <ChakraNextLink href={`/${CONFIG.trees}`}>
            <Button
              h='75px'
              minW='125px'
              variant='ghost'
              borderRadius={0}
              _active={{ borderBottom: '2px solid', bg: 'gray.100' }}
              isActive={_.includes(path, CONFIG.trees)}
            >
              {!currentTopHatName ? (
                <Text fontSize='lg'>{_.capitalize(CONFIG.trees)}</Text>
              ) : (
                <Stack align='start' w='90%' mx={3}>
                  <Text fontSize='sm'>{_.toUpper(CONFIG.trees)}</Text>
                  <Text fontSize='lg' color='gray.500'>
                    {_.capitalize(currentTopHatName)}
                  </Text>
                </Stack>
              )}
            </Button>
          </ChakraNextLink>
          <ChakraNextLink href={`/${CONFIG.wearers}/${address}`}>
            <Button
              h='75px'
              minW='125px'
              variant='ghost'
              borderRadius={0}
              fontSize='lg'
              _active={{ borderBottom: '2px solid', bg: 'gray.100' }}
              isActive={_.includes(path, address)}
            >
              {`My ${_.capitalize(CONFIG.hats)}`}
            </Button>
          </ChakraNextLink>
        </HStack>
      </HStack>

      <HStack spacing={2}>
        <IconButton
          icon={<Icon as={FaSearch} h='25px' w='25px' />}
          onClick={() => setOpen?.(true)}
          aria-label='Search'
        />
        <ConnectWallet />
      </HStack>
    </Flex>
  );
};

export default Navbar;

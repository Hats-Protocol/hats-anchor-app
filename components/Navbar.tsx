import {
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';
import { useAccount } from 'wagmi';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import ConnectWallet from '@/components/ConnectWallet';
import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { fetchHatDetails } from '@/gql/helpers';
import { fetchDetailsIpfs } from '@/hooks/useHatDetailsField';
import useLocalStorage from '@/hooks/useLocalStorage';
import { containsUpperCase } from '@/lib/general';
import { ipToPrettyId, prettyIdToId } from '@/lib/hats';

const Navbar = () => {
  const localOverlay = useOverlay();
  const { setCommandPallet: setOpen } = localOverlay;
  const router = useRouter();
  const path = router.asPath.split('/').slice(1);
  const { address } = useAccount();
  const [currentChain, setCurrentChain] = useState<number | undefined>();
  const [currentTopHatName, setCurrentTopHatName] = useState<
    string | undefined
  >();

  useEffect(() => {
    const getTopHatDetails = async () => {
      let chainId = 1;
      if (path.includes(CONFIG.trees)) {
        chainId = Number(path[1]);
        setCurrentChain(chainId);
      }
      const topHatId = ipToPrettyId(_.split(path[2], '?')[0]);

      if (!topHatId || topHatId === '0x') {
        return;
      }
      const topHat = await fetchHatDetails(
        prettyIdToId(topHatId),
        Number(chainId),
      );

      if (!topHat) {
        return;
      }
      if (topHat && topHat.details?.startsWith('ipfs://')) {
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

  const [clearBanner, setClearBanner] = useLocalStorage('clearBanner', false);

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
        <HStack spacing={5}>
          <ChakraNextLink href={`/${CONFIG.trees}/${currentChain || 1}`}>
            <Button
              h='75px'
              minW='125px'
              maxW='200px'
              variant='ghost'
              borderRadius={0}
              _active={{ borderBottom: '2px solid', bg: 'gray.100' }}
              isActive={_.includes(path, CONFIG.trees)}
            >
              {!currentTopHatName ? (
                <Text fontSize='lg'>{_.capitalize(CONFIG.trees)}</Text>
              ) : (
                <Stack align='start' w='90%' mx={2}>
                  <Text fontSize='sm'>{_.toUpper(CONFIG.trees)}</Text>
                  <Text fontSize='lg' color='gray.500' isTruncated maxW='170px'>
                    {containsUpperCase(currentTopHatName)
                      ? currentTopHatName
                      : _.capitalize(currentTopHatName)}
                  </Text>
                </Stack>
              )}
            </Button>
          </ChakraNextLink>
          {address && (
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
          )}
        </HStack>
      </HStack>

      {!clearBanner && CONFIG.banner && (
        <Flex
          bg='blue.600'
          color='white'
          h={10}
          fontSize='xs'
          pl={6}
          borderRadius={20}
          align='center'
        >
          <HStack spacing={1}>
            <Text fontWeight='bold'>Announcement:</Text>
            <Text textAlign='center'>
              We’re excited to share the brand new Hats App v2.0! 🎉
            </Text>
            <ChakraNextLink
              href='https://app.charmverse.io/hats-protocol/page-8570460396062165'
              isExternal
              decoration
              _hover={{ color: 'whiteAlpha.800' }}
              textAlign='center'
            >
              Read the launch post here.
            </ChakraNextLink>
          </HStack>
          <IconButton
            icon={<Icon as={IoCloseOutline} color='white' h='16px' w='16px' />}
            h='20px'
            w='20px'
            mx={4}
            minW={0}
            onClick={() => setClearBanner(true)}
            _hover={{ color: 'whiteAlpha.800', bg: 'whiteAlpha.400' }}
            aria-label='Close Announcement'
            variant='ghost'
          />
        </Flex>
      )}

      <HStack spacing={2}>
        {/* <IconButton
          icon={<Icon as={FaSearch} h='25px' w='25px' />}
          onClick={() => setOpen?.(true)}
          aria-label='Search'
          variant='outline'
        /> */}
        <ConnectWallet />
      </HStack>
    </Flex>
  );
};

export default Navbar;

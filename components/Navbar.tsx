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
import { useAccount } from 'wagmi';

import ChakraNextLink from '@/components/ChakraNextLink';
import ConnectWallet from '@/components/ConnectWallet';
import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { fetchHatDetails } from '@/gql/helpers';
import { fetchDetailsIpfs } from '@/hooks/useHatDetailsField';
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
          <ChakraNextLink href={`/${CONFIG.trees}/${currentChain || 1}`}>
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

      <HStack spacing={2}>
        <IconButton
          icon={<Icon as={FaSearch} h='25px' w='25px' />}
          onClick={() => setOpen?.(true)}
          aria-label='Search'
          variant='outline'
        />
        <ConnectWallet />
      </HStack>
    </Flex>
  );
};

export default Navbar;

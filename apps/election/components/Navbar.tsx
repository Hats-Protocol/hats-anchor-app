import {
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { CONFIG } from 'app-constants';
import { getOperatingSystem } from 'app-utils';
import { useHatDetailsField } from 'hats-hooks';
import { AppHat } from 'hats-types';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { BsSearch } from 'react-icons/bs';
import { ChakraNextLink } from 'ui';
import { useAccount, useChainId } from 'wagmi';

import { useOverlay } from '../contexts/OverlayContext';
import ConnectWallet from './ConnectWallet';

const Navbar = ({ hatData }: { hatData?: AppHat | null }) => {
  const currentChainId = useChainId();
  const { setCommandPalette: setOpen } = useOverlay();

  const router = useRouter();
  const path = router.asPath.split('/').slice(1);
  const { address } = useAccount();

  const { data: hatDetails } = useHatDetailsField(hatData?.details);
  const tabName = hatDetails?.data?.name || hatData?.details;

  const isCtrl = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return _.includes(['Windows', 'Linux', 'Unix'], getOperatingSystem(window));
  }, []);

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
          <ChakraNextLink
            href={`/${CONFIG.trees}/${hatData?.chainId || currentChainId || 1}`}
          >
            <Button
              h='75px'
              minW='125px'
              maxW='200px'
              variant='ghost'
              borderRadius={0}
            >
              <Stack align='start' w='90%' mx={2}>
                <Text
                  fontSize='sm'
                  textTransform='uppercase'
                  fontWeight='medium'
                  color='gray.800'
                >
                  Hats Election
                </Text>
                <Text fontSize='lg' isTruncated maxW='170px'>
                  {_.capitalize(tabName)}
                </Text>
              </Stack>
            </Button>
          </ChakraNextLink>
          {address && (
            <ChakraNextLink href='/'>
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
        <Tooltip label={`Search with ${isCtrl ? 'Ctrl' : 'Cmd'} + K`}>
          <IconButton
            icon={<Icon as={BsSearch} h='25px' w='25px' />}
            onClick={() => setOpen?.(true)}
            aria-label='Search'
            variant='ghost'
          />
        </Tooltip>
        <ConnectWallet />
      </HStack>
    </Flex>
  );
};

export default Navbar;

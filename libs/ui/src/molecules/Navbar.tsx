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
import { CONFIG } from '@hatsprotocol/constants';
import { useOverlay, useTreeForm } from 'contexts';
import { useHatDetailsField } from 'hats-hooks';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { BsSearch } from 'react-icons/bs';
import { AppHat } from 'types';
import { containsUpperCase, getOperatingSystem } from 'utils';
import { useAccount, useChainId } from 'wagmi';

import { ChakraNextLink } from '../atoms';
import ConnectWallet from './ConnectWallet';

const Navbar = ({ hatData }: { hatData?: AppHat }) => {
  const currentChainId = useChainId();
  const localOverlay = useOverlay();
  const { editMode } = useTreeForm();

  const router = useRouter();
  const path = router.asPath.split('/').slice(1);
  const { address } = useAccount();
  const { setCommandPalette: setOpen } = localOverlay;

  const { data: hatDetails } = useHatDetailsField(hatData?.details, editMode);
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
              _active={{ borderBottom: '2px solid', bg: 'gray.100' }}
              isActive={_.includes(path, CONFIG.trees)}
            >
              {!tabName ? (
                <Text size='lg'>{_.capitalize(CONFIG.trees)}</Text>
              ) : (
                <Stack align='start' w='90%' mx={2}>
                  <Text size='sm' textTransform='uppercase'>
                    {CONFIG.trees}
                  </Text>
                  <Text size='lg' variant='gray' maxW='170px' isTruncated>
                    {containsUpperCase(tabName)
                      ? tabName
                      : _.capitalize(tabName)}
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
        <Tooltip label={`Search with ${isCtrl ? 'Ctrl' : 'Cmd'} + K`}>
          <IconButton
            icon={<Icon as={BsSearch} h='25px' w='25px' />}
            onClick={() => setOpen?.(true)}
            aria-label='Search'
            variant='ghost'
          />
        </Tooltip>

        <ConnectWallet overlay={localOverlay} />
      </HStack>
    </Flex>
  );
};

export default Navbar;

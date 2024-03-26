import {
  // Box,
  Button,
  // Divider,
  Flex,
  // Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  // Popover,
  // PopoverArrow,
  // PopoverBody,
  // PopoverCloseButton,
  // PopoverContent,
  // PopoverTrigger,
  // Portal,
  // Spinner,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { useOverlay, useTreeForm } from 'contexts';
import { useHatDetailsField } from 'hats-hooks';
import { useLocalStorage } from 'hooks';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { BsSearch } from 'react-icons/bs';
// import { FaBell } from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';
import { AppHat } from 'types';
import { containsUpperCase, getOperatingSystem } from 'utils';
import { useAccount, useChainId } from 'wagmi';

import { ChakraNextLink } from '../atoms';
import ConnectWallet from './ConnectWallet';
// import TransactionHistory from './TransactionHistory';

const BANNER = {
  message: 'Goerli is deprecated and will shut down soon!',
  label: 'Migrate Goerli trees to Sepolia by January 31',
  linkTo: CONFIG.docsLinks.forking,
};

const Navbar = ({ hatData }: { hatData?: AppHat }) => {
  const currentChainId = useChainId();
  const { setCommandPalette: setOpen } = useOverlay();
  const { editMode } = useTreeForm();

  const router = useRouter();
  const path = router.asPath.split('/').slice(1);
  const { address } = useAccount();
  const localOverlay = useOverlay();

  const { data: hatDetails } = useHatDetailsField(hatData?.details, editMode);
  const tabName = hatDetails?.data?.name || hatData?.details;

  const [clearBanner, setClearBanner] = useLocalStorage(
    'clearBanner-new',
    false,
  );

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

      {!clearBanner && CONFIG.banner && (
        <Flex
          bg='blue.600'
          color='white'
          h={12}
          fontSize='xs'
          pl={8}
          borderRadius={20}
          align='center'
        >
          <Stack spacing='1px'>
            <Text textAlign='center'>{BANNER.message}</Text>
            <ChakraNextLink
              href={BANNER.linkTo}
              isExternal
              decoration
              _hover={{ color: 'whiteAlpha.800' }}
              textAlign='center'
            >
              {BANNER.label}
            </ChakraNextLink>
          </Stack>
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

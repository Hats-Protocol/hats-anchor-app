import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { CONFIG } from 'app-constants';
import { useLocalStorage } from 'app-hooks';
import { containsUpperCase, getOperatingSystem } from 'app-utils';
import { useHatDetailsField } from 'hats-hooks';
import { AppHat, Transaction } from 'hats-types';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { BsSearch } from 'react-icons/bs';
import { FaBell } from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';
import { useAccount, useChainId } from 'wagmi';

import { useOverlay } from '../contexts/OverlayContext';
import { useTreeForm } from '../contexts/TreeFormContext';
import ChakraNextLink from './atoms/ChakraNextLink';
import ConnectWallet from './ConnectWallet';
import TransactionHistory from './TransactionHistory';

const Navbar = ({ hatData }: { hatData?: AppHat }) => {
  const currentChainId = useChainId();
  const {
    setCommandPalette: setOpen,
    setModals,
    transactions,
    clearAllTransactions,
  } = useOverlay();
  const { editMode } = useTreeForm();

  const router = useRouter();
  const path = router.asPath.split('/').slice(1);
  const { address } = useAccount();

  const hasPendingTransactions = transactions.some(
    (tx: Transaction) => tx.status === 'pending',
  );

  const { data: hatDetails } = useHatDetailsField(hatData?.details, editMode);
  const tabName = hatDetails?.data?.name || hatData?.details;

  const [clearBanner, setClearBanner] = useLocalStorage('clearBanner', false);
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
                <Text fontSize='lg'>{_.capitalize(CONFIG.trees)}</Text>
              ) : (
                <Stack align='start' w='90%' mx={2}>
                  <Text fontSize='sm'>{_.toUpper(CONFIG.trees)}</Text>
                  <Text fontSize='lg' color='gray.500' isTruncated maxW='170px'>
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
        <Tooltip label={`Search with ${isCtrl ? 'Ctrl' : 'Cmd'} + K`}>
          <IconButton
            icon={<Icon as={BsSearch} h='25px' w='25px' />}
            onClick={() => setOpen?.(true)}
            aria-label='Search'
            variant='ghost'
          />
        </Tooltip>

        <Popover trigger='hover'>
          <PopoverTrigger>
            {hasPendingTransactions ? (
              <Spinner />
            ) : (
              <IconButton
                icon={<Icon as={FaBell} h='25px' w='25px' />}
                aria-label='Notifications'
                variant='ghost'
              />
            )}
          </PopoverTrigger>
          <Portal>
            <PopoverContent width='auto' minW='300px'>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody>
                <Box>
                  <HStack w='full' justify='space-between' align='center'>
                    <Heading
                      size='sm'
                      fontWeight='medium'
                      textTransform='uppercase'
                      mb={1}
                    >
                      History
                    </Heading>
                    <Button
                      size='xs'
                      variant='ghost'
                      colorScheme='blue'
                      onClick={clearAllTransactions}
                      mr={6}
                      isDisabled={_.isEmpty(transactions)}
                    >
                      Clear
                    </Button>
                  </HStack>
                  <TransactionHistory count={5} />
                  {_.gt(_.size(transactions), 5) && (
                    <>
                      <Divider my={2} />
                      <Button
                        onClick={() => setModals?.({ transactions: true })}
                        variant='link'
                        colorScheme='blue'
                      >
                        View Full History
                      </Button>
                    </>
                  )}
                </Box>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
        <ConnectWallet />
      </HStack>
    </Flex>
  );
};

export default Navbar;

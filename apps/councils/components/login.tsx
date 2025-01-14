'use client';

import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { useMediaStyles } from 'hooks';
import { toLower } from 'lodash';
import { createIcon } from 'opepen-standard';
import { useMemo } from 'react';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId, useEnsAvatar, useEnsName } from 'wagmi';

const Login = () => {
  const { ready, authenticated, login, logout, user, linkEmail, unlinkEmail, linkWallet } = usePrivy();
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: ensName } = useEnsName({ address: user?.wallet?.address ?? undefined, chainId: 1 });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName as string,
    chainId: 1,
  });

  const getChainIcon = (chainId: number) => {
    switch (chainId) {
      case 10:
        return '/chains/optimism.svg';
      case 1:
        return '/chains/ethereum.svg';
      case 42161:
        return '/chains/arbitrum.svg';
      case 8453:
        return '/chains/base.svg';
      case 100:
        return '/chains/gnosis.png';
      case 137:
        return '/chains/polygon.svg';
      case 42220:
        return '/chains/celo.svg';
      case 11155111:
        return '/chains/sepolia.png';
      default:
        return undefined;
    }
  };

  const fallbackAvatar = useMemo(() => {
    if (!user || !user.wallet) return undefined;
    return createIcon({
      seed: toLower(user.wallet.address),
      size: 64,
    }).toDataURL();
  }, [user]);

  if (!ready) {
    return <Skeleton w={{ base: '100px', md: '200px' }} h='40px' borderRadius='md' />;
  }

  if (!user || !authenticated || !user.wallet) {
    return (
      <Button onClick={login} variant='whiteFilled' size='md' height='40px'>
        Login
      </Button>
    );
  }

  return (
    <HStack spacing={1}>
      <Button
        disabled
        p={0}
        w='36px'
        h='36px'
        minW='36px'
        borderWidth='1px'
        borderColor='gray.200'
        borderRadius='md'
        bg='white'
        _hover={{ bg: 'white' }}
        _disabled={{
          opacity: 1,
          cursor: 'default',
        }}
      >
        {chainId && (
          <Image src={getChainIcon(chainId)} alt='Chain Icon' width='24px' height='24px' objectFit='contain' />
        )}
      </Button>

      <Popover placement='bottom-end'>
        <PopoverTrigger>
          <Button
            p={0}
            w='36px'
            h='36px'
            minW='36px'
            borderWidth='1px'
            borderColor='gray.200'
            borderRadius='md'
            bg='white'
            _hover={{ bg: 'gray.50' }}
          >
            <Image
              src={ensAvatar || fallbackAvatar}
              alt='Profile'
              width='24px'
              height='24px'
              borderRadius='full'
              fallback={<Box bg='gray.100' w='24px' h='24px' borderRadius='full' />}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent width='300px' bg='white' borderColor='gray.200'>
          <PopoverBody py={4}>
            <VStack spacing={4} align='stretch'>
              <VStack align='center' spacing={2}>
                <Box boxSize='48px' borderRadius='full' overflow='hidden'>
                  <Image src={ensAvatar || fallbackAvatar} alt='Profile' width='100%' height='100%' objectFit='cover' />
                </Box>
                <Text fontWeight='medium'>{ensName || formatAddress(user.wallet.address as Hex)}</Text>
              </VStack>

              {user.email && (
                <VStack>
                  <HStack justify='space-between'>
                    <Text color='gray.500'>Email</Text>
                    <Text>{user.email.address}</Text>
                  </HStack>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      unlinkEmail(user.email!.address);
                    }}
                  >
                    Unlink Email
                  </Button>
                </VStack>
              )}

              {!user.email ? (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => {
                    linkEmail();
                  }}
                >
                  Link Email
                </Button>
              ) : null}

              <Button size='sm' variant='solid' colorScheme='red' onClick={logout}>
                Disconnect
              </Button>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </HStack>
  );
};

export default Login;

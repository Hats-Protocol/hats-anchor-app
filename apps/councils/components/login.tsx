'use client';

import {
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Skeleton,
  Text,
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
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { address } = useAccount();
  const chainId = useChainId();
  const { isMobile } = useMediaStyles();
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName as string,
    chainId: 1,
  });

  const fallbackAvatar = useMemo(() => {
    if (!address) return undefined;
    return createIcon({
      seed: toLower(address),
      size: 64,
    }).toDataURL();
  }, [address]);

  if (!ready) {
    return (
      <Skeleton w={{ base: '100px', md: '200px' }} h='40px' borderRadius='md' />
    );
  }

  if (!user || !authenticated) {
    return (
      <Button onClick={login} variant='whiteFilled'>
        Login
      </Button>
    );
  }

  return (
    <Button onClick={logout} variant='whiteFilled'>
      Logout
    </Button>
  );
};

export default Login;

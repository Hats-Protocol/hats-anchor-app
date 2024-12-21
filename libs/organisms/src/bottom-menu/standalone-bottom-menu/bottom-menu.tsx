'use client';

import { Box, Flex, Skeleton } from '@chakra-ui/react';
import { useEligibility } from 'contexts';
import { ClaimButton } from 'modules-ui';
import { NetworkSwitcher } from 'molecules';
import React from 'react';
import { useChainId } from 'wagmi';

import { BottomMoreMenu } from './bottom-more-menu';

const MenuWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      w='100%'
      position='fixed'
      bottom={0}
      zIndex={14}
      bg='whiteAlpha.900'
      display={{ base: 'block', '2xl': 'none' }}
    >
      <Flex
        p={2}
        borderTop='1px solid'
        borderColor='gray.200'
        direction={{ base: 'row', md: 'row-reverse' }}
        justify='space-between'
      >
        {children}
      </Flex>
    </Box>
  );
};

export const StandaloneBottomMenu = () => {
  const currentNetworkId = useChainId();
  const { chainId, isHatDetailsLoading, isEligibilityRulesLoading } =
    useEligibility();

  if (
    !currentNetworkId ||
    !chainId ||
    isHatDetailsLoading ||
    isEligibilityRulesLoading
  ) {
    return (
      <MenuWrapper>
        <Skeleton
          w={{ base: '25%', md: '250px' }}
          h='full'
          minH='40px'
          borderRadius='md'
        />

        <Skeleton
          w={{ base: '25%', md: '100px' }}
          h='full'
          minH='40px'
          borderRadius='md'
        />
      </MenuWrapper>
    );
  }

  if (currentNetworkId !== chainId) {
    return (
      <MenuWrapper>
        <NetworkSwitcher chainId={chainId} />

        <BottomMoreMenu />
      </MenuWrapper>
    );
  }

  return (
    <MenuWrapper>
      <ClaimButton />

      <BottomMoreMenu />
    </MenuWrapper>
  );
};

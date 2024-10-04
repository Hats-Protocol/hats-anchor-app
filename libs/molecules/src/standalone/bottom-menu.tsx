'use client';

import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Link,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useEligibility, useOverlay } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { includes, map } from 'lodash';
import { useClaimFn } from 'modules-hooks';
import dynamic from 'next/dynamic';
import React from 'react';
import { BsArrowRight } from 'react-icons/bs';
import { FiExternalLink } from 'react-icons/fi';
import { idToIp } from 'shared';
import { AppHat } from 'types';
import { hatLink } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import NetworkSwitcher from '../NetworkSwitcher';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const MenuWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box w='100%' position='fixed' bottom={0} zIndex={14} bg='whiteAlpha.900'>
      <Flex
        p={2}
        borderTop='1px solid'
        borderColor='gray.200'
        justify='space-between'
      >
        {children}
      </Flex>
    </Box>
  );
};

const FullRoleLink = () => {
  const { selectedHat, chainId } = useEligibility();
  const link = hatLink({ hatId: selectedHat?.id, chainId });
  return (
    <Link href={link} isExternal>
      <Button
        variant='outline'
        rightIcon={<Icon as={FiExternalLink} boxSize={4} />}
      >
        View full role
      </Button>
    </Link>
  );
};

export const BottomMenu = () => {
  const currentNetworkId = useChainId();
  const { handlePendingTx } = useOverlay();
  const {
    chainId,
    selectedHat,
    moduleParameters,
    moduleDetails,
    controllerAddress,
    isClaimableFor,
    isHatDetailsLoading,
    isModuleDetailsLoading,
    hatterIsAdmin,
    requireHatter,
    isEligible: isReadyToClaim, // TODO fix
  } = useEligibility();

  const { address } = useAccount();

  const { data: wearer } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });
  const isWearing = includes(map(wearer, 'id'), selectedHat?.id);

  const { handleClaim, isLoading, isEligible } = useClaimFn({
    selectedHat: selectedHat as AppHat,
    handlePendingTx,
    moduleParameters,
    moduleDetails,
    controllerAddress,
    chainId,
  });
  const disableClaim = false;

  const hatUrl = selectedHat?.id
    ? `${CONFIG.APP_URL}/trees/${chainId}/${hatIdToTreeId(
        BigInt(selectedHat.id),
      )}?hatId=${idToIp(selectedHat.id)}`
    : '#';

  if (
    !currentNetworkId ||
    !chainId ||
    isHatDetailsLoading ||
    isModuleDetailsLoading
  ) {
    return (
      <MenuWrapper>
        <Skeleton w='200px' h='full' minH='40px' borderRadius='md' />

        <FullRoleLink />
      </MenuWrapper>
    );
  }

  if (isWearing && isEligible) {
    return (
      <MenuWrapper>
        <Button
          as={Link}
          href={hatUrl}
          colorScheme='green'
          leftIcon={<Icon as={HatIcon} color='white' />}
          rightIcon={<Icon as={BsArrowRight} color='white' />}
          isExternal
        >
          View your hat
        </Button>
      </MenuWrapper>
    );
  }

  if (currentNetworkId !== chainId) {
    return (
      <MenuWrapper>
        <NetworkSwitcher chainId={chainId} />

        <FullRoleLink />
      </MenuWrapper>
    );
  }

  let hatterIfNeeded = false;
  // check hatter if needed
  if (requireHatter) {
    // hatter must be an admin wearer
    // can't claim if not claimable for - module claims on behalf of user
    hatterIfNeeded = !hatterIsAdmin || !isClaimableFor;
  }

  return (
    <MenuWrapper>
      <Button
        variant='primary'
        // won't hit this flow if wrong network
        isDisabled={hatterIfNeeded || disableClaim || !isReadyToClaim}
        onClick={handleClaim}
        isLoading={isLoading}
      >
        <HStack>
          <HatIcon />
          <Text>Claim this Hat</Text>
        </HStack>
      </Button>

      <FullRoleLink />
    </MenuWrapper>
  );
};

'use client';

import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { useEligibility, useOverlay } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import _ from 'lodash';
import {
  useAgreementClaim,
  useHatClaimBy,
  useMultiClaimsHatterCheck,
} from 'modules-hooks';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { BsArrowRight, BsThreeDotsVertical } from 'react-icons/bs';
import { idToIp } from 'shared';
import { AppHat } from 'types';
import { hatLink } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId, useEnsName } from 'wagmi';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));
const MobileHatCard = dynamic(() =>
  import('molecules').then((mod) => mod.MobileHatCard),
);
const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);
const NetworkSwitcher = dynamic(() =>
  import('molecules').then((mod) => mod.NetworkSwitcher),
);

// TODO this isn't specific to this module, move up

const BottomMenu = ({ isReviewed }: { isReviewed: boolean }) => {
  const currentNetworkId = useChainId();
  const {
    moduleParameters,
    moduleDetails,
    controllerAddress,
    chainId,
    selectedHat,
  } = useEligibility();
  const queryClient = useQueryClient();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { address } = useAccount();
  const [isSuccess, setIsSuccess] = useState(false);
  const { handlePendingTx } = useOverlay();
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasDeclined, setHasDeclined] = useState(false);

  const { hatterIsAdmin } = useHatClaimBy({
    selectedHat,
    chainId,
    wearer: address as Hex,
    handlePendingTx,
  });

  const { data: wearer } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });
  const isWearing = _.includes(_.map(wearer, 'id'), selectedHat?.id);

  const { data: ensName } = useEnsName({
    address,
    chainId: 1,
  });

  const { instanceAddress, currentHatIsClaimable } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    onchainHats: selectedHat ? [selectedHat] : [],
  });

  const { signAndClaim, isLoading } = useAgreementClaim({
    moduleParameters,
    moduleDetails,
    chainId,
    controllerAddress,
    mchAddress: instanceAddress,
    onSuccessfulSign: () => {
      setIsSuccess(true);
      setHasDeclined(false);
      setIsClaiming(false);

      // should implement useWaitForSubgraph when merged
      queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
      queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
    },
    onDecline: () => {
      setIsClaiming(false);
      setHasDeclined(true);
    },
  });

  const handleClaim = () => {
    signAndClaim?.();
    setIsClaiming(true);
    setHasDeclined(false);
    onOpen();
  };

  const hatUrl = `${CONFIG.APP_URL}/trees/${chainId}/${hatIdToTreeId(
    BigInt(selectedHat?.id as string),
  )}?hatId=${idToIp(selectedHat?.id)}`;

  return (
    <Box w='100%' position='fixed' bottom={0} zIndex={14} bg='whiteAlpha.900'>
      <Flex
        p={2}
        borderTop='1px solid'
        borderColor='gray.200'
        justify='space-between'
      >
        {isWearing ? (
          <Button
            as={Link}
            href={hatUrl}
            colorScheme='green'
            leftIcon={<Icon as={HatIcon} color='white' />}
            rightIcon={<Icon as={BsArrowRight} color='white' />}
          >
            View your hat
          </Button>
        ) : currentNetworkId !== chainId ? (
          <NetworkSwitcher chainId={chainId} />
        ) : (
          <Button
            colorScheme='blue'
            isDisabled={
              !isReviewed ||
              !hatterIsAdmin ||
              chainId !== currentNetworkId ||
              !currentHatIsClaimable?.for ||
              isWearing
            }
            onClick={handleClaim}
            leftIcon={<Icon as={HatIcon} color='white' />}
            isLoading={isLoading}
          >
            Claim this Hat
          </Button>
        )}
        {!isWearing && (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<Icon as={BsThreeDotsVertical} />}
              aria-label='Menu'
              variant='outline'
            />
            <MenuList>
              <ChakraNextLink
                href={hatLink({ hatId: selectedHat?.id, chainId })}
                isExternal
              >
                <MenuItem>View Hat</MenuItem>
              </ChakraNextLink>
            </MenuList>
          </Menu>
        )}
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          width='calc(100% - 40px)'
          position='absolute'
          bottom='20px'
          mb={0}
        >
          <ModalHeader alignSelf={isSuccess ? 'center' : 'flex-start'}>
            {(isLoading || isClaiming) && 'Claiming your hat'}
            {isSuccess && !isLoading && 'Hat claimed successfully'}
          </ModalHeader>
          {!isSuccess && <ModalCloseButton />}
          <ModalBody overflowY='scroll'>
            <Stack>
              <MobileHatCard
                hat={selectedHat as AppHat}
                chainId={chainId}
                isWearing={isWearing || isSuccess}
                ensName={ensName}
              />
              {(isLoading || isClaiming) && (
                <Text size='sm'>
                  Waiting for your transaction to be confirmed. Please don’t
                  close this page.
                </Text>
              )}

              {isSuccess && (
                <Box>Congratulations! You are wearing this hat now!</Box>
              )}
              {hasDeclined && (
                <Text color='red.500' fontSize='sm'>
                  You have declined to sign the agreement. Please try again.
                </Text>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            {(isLoading || isClaiming) && (
              <Button
                colorScheme='blue'
                leftIcon={<Spinner size='sm' />}
                w='full'
              >
                Claiming your hat ...
              </Button>
            )}
            {!isLoading && !isClaiming && isSuccess && (
              <Button
                as={Link}
                href={hatUrl}
                colorScheme='green'
                leftIcon={<Icon as={HatIcon} color='white' />}
                rightIcon={<Icon as={BsArrowRight} color='white' />}
                w='full'
                onClick={() => {
                  onClose();
                }}
              >
                View your hat
              </Button>
            )}
            {hasDeclined && !isLoading && (
              <Button
                variant='outlineMatch'
                borderColor='red.500'
                color='red.500'
                leftIcon={<Icon as={HatIcon} color='white' />}
                rightIcon={<Icon as={BsArrowRight} color='white' />}
                w='full'
                onClick={signAndClaim}
              >
                Try again
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BottomMenu;

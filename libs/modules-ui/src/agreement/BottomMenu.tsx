import {
  Box,
  Button,
  Flex,
  Icon,
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
import { useEligibility, useOverlay } from 'contexts';
import { useHatClaimBy, useWearerDetails } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { BsArrowRight } from 'react-icons/bs';
import { idToIp } from 'shared';
import { AppHat } from 'types';
import { useAccount, useChainId, useEnsName } from 'wagmi';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));
const MobileHatCard = dynamic(() =>
  import('ui').then((mod) => mod.MobileHatCard),
);

const BottomMenu = ({ isSigned }: { isSigned: boolean }) => {
  const currentNetworkId = useChainId();
  const { selectedHat, chainId } = useEligibility();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { address } = useAccount();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const { handlePendingTx } = useOverlay();
  const [isClaiming, setIsClaiming] = useState(false);

  const { claimHat, hatterIsAdmin, isClaimable, isLoading, error } =
    useHatClaimBy({
      selectedHat,
      chainId,
      wearer: address,
      handlePendingTx,
      onSuccess: () => {
        setIsClaiming(false);
        setIsSuccess(true);
      },
    });

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const isWearing = _.includes(_.map(wearer, 'id'), selectedHat?.id);

  const handleClick = () => {
    claimHat?.();
    setIsClaiming(true);
    onOpen();
  };

  const { data: ensName } = useEnsName({
    address,
    chainId: 1,
    enabled: !!address,
  });

  const hatUrl = `${CONFIG.APP_URL}/trees/${chainId}/${hatIdToTreeId(
    BigInt(selectedHat?.id as string),
  )}?hatId=${idToIp(selectedHat?.id)}`;

  const errorMessage =
    error?.name === 'TransactionExecutionError' &&
    error.message.includes('User rejected the request')
      ? 'User rejected the request'
      : 'Error occurred while processing the transaction.';

  return (
    <Box w='100%' position='fixed' bottom={0} zIndex={14} bg='whiteAlpha.900'>
      <Flex p={2} borderTop='1px solid' borderColor='gray.200'>
        {isWearing ? (
          <Button
            colorScheme='green'
            leftIcon={<Icon as={HatIcon} color='white' />}
            rightIcon={<Icon as={BsArrowRight} color='white' />}
            onClick={() => {
              router.push(hatUrl);
            }}
          >
            View your hat
          </Button>
        ) : (
          <Button
            colorScheme='blue'
            isDisabled={
              !claimHat ||
              !hatterIsAdmin ||
              chainId !== currentNetworkId ||
              !isClaimable ||
              !isSigned
            }
            onClick={handleClick}
            leftIcon={<Icon as={HatIcon} color='white' />}
            isLoading={isLoading}
          >
            Claim this Hat
          </Button>
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
              {error && errorMessage && (
                <Text color='red.500' fontSize='sm'>
                  {errorMessage}
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
                colorScheme='green'
                leftIcon={<Icon as={HatIcon} color='white' />}
                rightIcon={<Icon as={BsArrowRight} color='white' />}
                w='full'
                onClick={() => {
                  onClose();
                  router.push(hatUrl);
                }}
              >
                View your hat
              </Button>
            )}
            {error && !isLoading && (
              <Button
                variant='outlineMatch'
                borderColor='red.500'
                color='red.500'
                leftIcon={<Icon as={HatIcon} color='white' />}
                rightIcon={<Icon as={BsArrowRight} color='white' />}
                w='full'
                onClick={claimHat}
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

'use client';

import {
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { NETWORK_IMAGES } from '@hatsprotocol/constants';
import { useChainModal } from '@rainbow-me/rainbowkit';
import { useOverlay } from 'contexts';
import { useClipboard } from 'hooks';
import { isEmpty, size } from 'lodash';
import dynamic from 'next/dynamic';
import { BsBoxArrowRight } from 'react-icons/bs';
import { FaCaretRight } from 'react-icons/fa';
import { SupportedChains } from 'types';
import { ChakraNextLink, OblongAvatar } from 'ui';
import { chainsMap, formatAddress, formatRoundedDecimals } from 'utils';
import { Hex } from 'viem';
import { useBalance, useChainId, useDisconnect } from 'wagmi';

import TransactionHistory from './TransactionHistory';

const CopyAddress = dynamic(() => import('icons').then((i) => i.CopyAddress));
const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));

const WalletProfile = ({
  address,
  name,
  avatar,
}: {
  address: Hex;
  name: string;
  avatar: string | undefined;
}) => {
  const chainId = useChainId();
  const { transactions, setModals } = useOverlay();
  const { data: balance } = useBalance({ address, chainId });
  const { openChainModal } = useChainModal();
  const { disconnect } = useDisconnect();

  const { onCopy } = useClipboard(address, {
    toastData: { title: 'Address copied' },
  });

  const toggleNetworkModal = () => {
    setModals?.({});
    openChainModal?.();
  };

  const toggleTransactionHistoryModal = () => {
    setModals?.({ transactions: true });
  };

  const handleDisconnect = () => {
    setModals?.({});
    disconnect();
  };

  return (
    <Stack>
      <HStack spacing={6}>
        {avatar && <OblongAvatar src={avatar} />}
        <Stack>
          <Heading size='xl'>{name}</Heading>
          <HStack gap={4}>
            <Skeleton isLoaded={!!balance?.value}>
              <Text size='sm'>
                {formatRoundedDecimals({
                  value: balance?.value,
                  decimals: balance?.decimals || 18,
                  rounded: 2,
                })}{' '}
                {balance?.symbol}
              </Text>
            </Skeleton>
            <Button
              size='xs'
              variant='ghost'
              rightIcon={<Icon as={CopyAddress} />}
              color='blue.500'
              onClick={onCopy}
            >
              {formatAddress(address)}
            </Button>
          </HStack>
        </Stack>
      </HStack>
      <Flex justify='space-between' gap={2} mb={2}>
        <Button w='full' variant='outline' onClick={toggleNetworkModal}>
          <HStack>
            <Image
              src={NETWORK_IMAGES[chainId as SupportedChains]}
              boxSize={5}
            />
            <Text>{chainsMap(chainId)?.name}</Text>
          </HStack>
        </Button>
        <ChakraNextLink
          href={`/wearers/${address}`}
          onClick={() => setModals?.({})}
          w='full'
        >
          <Button w='100%' variant='outline'>
            <HStack>
              <Icon as={WearerIcon} color='blackAlpha.700' />
              <Text>Profile</Text>
            </HStack>
          </Button>
        </ChakraNextLink>
      </Flex>
      {!isEmpty(transactions) && (
        <Stack>
          <Heading size='md'>Transaction History</Heading>
          <TransactionHistory
            count={2}
            transactions={transactions || []}
            hideHash
          />
          {size(transactions) > 2 && (
            <Flex>
              <Button
                variant='ghost'
                size='sm'
                onClick={toggleTransactionHistoryModal}
                rightIcon={<Icon as={FaCaretRight} />}
              >
                Show full history
              </Button>
            </Flex>
          )}
        </Stack>
      )}

      <Flex>
        <Button
          variant='outlineMatch'
          colorScheme='red.500'
          onClick={handleDisconnect}
          leftIcon={<Icon as={BsBoxArrowRight} />}
          w='full'
        >
          Sign Out
        </Button>
      </Flex>
    </Stack>
  );
};

export default WalletProfile;

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react';
import { networkImages } from '@hatsprotocol/constants';
import { useChainModal } from '@rainbow-me/rainbowkit';
import { useClipboard } from 'hooks';
import { CopyAddress, WearerIcon } from 'icons';
import _ from 'lodash';
import { BsBoxArrowRight } from 'react-icons/bs';
import { FaCaretRight } from 'react-icons/fa';
import { OverlayContextProps, StandaloneOverlayContextProps } from 'types';
import { chainsMap, formatAddress } from 'utils';
import { Hex } from 'viem';
import { useBalance, useChainId, useDisconnect } from 'wagmi';

import { ChakraNextLink } from '../atoms';
import TransactionHistory from './TransactionHistory';

const OblongAvatar = ({
  image,
  height = 96,
}: {
  image: string;
  height?: number;
}) => {
  return (
    <Box
      backgroundImage={image}
      backgroundSize='cover'
      backgroundPosition='center'
      h={`${height}px`}
      w={`${height * 0.75}px`}
      borderRadius='md'
    />
  );
};

const WalletProfile = ({
  address,
  name,
  avatar,
  localOverlay,
}: {
  address: Hex;
  name: string;
  avatar: string | undefined;
  localOverlay: StandaloneOverlayContextProps | OverlayContextProps | undefined;
}) => {
  const chainId = useChainId();
  const { transactions, setModals } = _.pick(localOverlay, [
    'transactions',
    'setModals',
  ]);
  const { data: balance } = useBalance({ address, chainId });
  const { openChainModal } = useChainModal();
  const { disconnect } = useDisconnect();

  const { handleCopy } = useClipboard(address, {
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
        {avatar && <OblongAvatar image={avatar} />}
        <Stack>
          <Heading size='xl'>{name}</Heading>
          <HStack gap={4}>
            <Text size='sm'>
              {_.toNumber(balance?.formatted).toFixed(2)} {balance?.symbol}
            </Text>
            <Button
              size='xs'
              variant='ghost'
              rightIcon={<Icon as={CopyAddress} />}
              color='blue.500'
              onClick={handleCopy}
            >
              {formatAddress(address)}
            </Button>
          </HStack>
        </Stack>
      </HStack>
      <Flex justify='space-between' gap={2} mb={2}>
        <Button w='full' variant='outline' onClick={toggleNetworkModal}>
          <HStack>
            <Image src={networkImages[chainId]} boxSize={5} />
            <Text>{chainsMap(chainId)?.name}</Text>
          </HStack>
        </Button>
        <ChakraNextLink href={`/wearers/${address}`} w='full'>
          <Button w='100%' variant='outline'>
            <HStack>
              <Icon as={WearerIcon} color='blackAlpha.700' />
              <Text>Profile</Text>
            </HStack>
          </Button>
        </ChakraNextLink>
      </Flex>
      {!_.isEmpty(transactions) && (
        <Stack>
          <Heading size='md'>Transaction History</Heading>
          <TransactionHistory
            count={2}
            transactions={transactions || []}
            hideHash
          />
          {_.size(transactions) > 2 && (
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

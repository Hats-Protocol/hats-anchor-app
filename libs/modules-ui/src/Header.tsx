'use client';

import {
  Badge,
  Box,
  Heading,
  HStack,
  Icon,
  Image,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { MUTABILITY, STATUS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { useClipboard } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const Markdown = dynamic(() => import('ui').then((mod) => mod.Markdown));
const CopyHash = dynamic(() => import('icons').then((mod) => mod.CopyHash));

const Header = () => {
  const { address } = useAccount();
  const { chainId, selectedHat, selectedHatDetails, isHatDetailsLoading } =
    useEligibility();
  const { onCopy } = useClipboard(selectedHat?.id as string, {
    toastData: { title: 'Successfully copied hat ID to clipboard' },
  });

  const { name, description } = _.pick(selectedHatDetails, [
    'name',
    'description',
  ]);

  const { data: wearer } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });
  const isCurrentWearer = _.includes(_.map(wearer, 'id'), selectedHat?.id);

  const levelAtLocalTree = selectedHat?.levelAtLocalTree || 0;
  const mutableStatus = selectedHat?.mutable
    ? MUTABILITY.MUTABLE
    : MUTABILITY.IMMUTABLE;
  const activeStatus = selectedHat?.status ? STATUS.ACTIVE : STATUS.INACTIVE;

  return (
    <Stack
      background='linear-gradient(180deg, rgba(247, 250, 252, 0.00) 0%, #F7FAFC 34.5%)'
      pb={2}
    >
      <Box width='100%'>
        <Skeleton minH='250px' isLoaded={!isHatDetailsLoading}>
          <Image
            src={_.get(selectedHat, 'imageUrl') || '/icon.jpeg'}
            alt='Hat image'
            background='white'
            objectFit='cover'
            width='100%'
            height='auto'
          />
        </Skeleton>

        <Skeleton isLoaded={!isHatDetailsLoading}>
          <HStack mt={-2} pl={4}>
            {isCurrentWearer && <Badge colorScheme='green'>My Hat</Badge>}

            <Badge
              colorScheme={
                mutableStatus === MUTABILITY.MUTABLE ? 'blue' : 'red'
              }
            >
              {mutableStatus}
            </Badge>

            <Badge
              colorScheme={activeStatus === STATUS.ACTIVE ? 'green' : 'red'}
            >
              {activeStatus}
            </Badge>

            <Badge>Level {levelAtLocalTree}</Badge>
          </HStack>
        </Skeleton>
      </Box>

      <Stack w='full' px={4}>
        <HStack justify='space-between' gap={2} w='full' alignItems='baseline'>
          <Tooltip label={name || selectedHat?.details}>
            <Heading noOfLines={{ base: 2, md: 1 }}>
              {name || selectedHat?.details}
            </Heading>
          </Tooltip>

          <HStack spacing={1}>
            <Text color='blue.500'>
              {hatIdDecimalToIp(BigInt(selectedHat?.id || 0))}
            </Text>

            <Icon
              as={CopyHash}
              color='blue.500'
              cursor='pointer'
              h={4}
              onClick={onCopy}
            />
          </HStack>
        </HStack>

        {description && (
          <Markdown collapse maxHeight={70}>
            {description}
          </Markdown>
        )}
      </Stack>
    </Stack>
  );
};

export default Header;
